package com.busreservation.service;

import com.busreservation.dto.CreateBookingRequest;
import com.busreservation.entity.*;
import com.busreservation.pattern.observer.BookingEventPublisher;
import com.busreservation.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests the core Reliability NFR: the same seat on the same schedule cannot
 * have two active (PENDING/CONFIRMED) bookings at once, plus the multi-seat
 * group-checkout behaviour (one groupRef shared across every seat in a
 * single booking request).
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ScheduleRepository scheduleRepository;
    @Mock private SeatRepository seatRepository;
    @Mock private StopRepository stopRepository;
    @Mock private WaitingListRepository waitingListRepository;
    @Mock private BookingEventPublisher eventPublisher;

    @InjectMocks
    private BookingService bookingService;

    private User passenger;
    private Schedule schedule;
    private Bus bus;
    private Seat seat;
    private Seat seat2;
    private Stop pickup;
    private Stop drop;

    @BeforeEach
    void setUp() {
        passenger = User.builder().id(1L).name("Nimal").role(Role.PASSENGER).build();
        bus = Bus.builder().id(1L).plateNumber("NB-1234").build();
        Route route = Route.builder().id(1L).name("Colombo - Kandy").build();
        schedule = Schedule.builder().id(10L).bus(bus).route(route).build();
        seat = Seat.builder().id(100L).bus(bus).seatNumber("5").build();
        seat2 = Seat.builder().id(101L).bus(bus).seatNumber("6").build();
        pickup = Stop.builder().id(1L).name("Colombo Fort").build();
        drop = Stop.builder().id(4L).name("Kandy").build();
    }

    @Test
    void bookingSameSeatTwice_forSameSchedule_isRejected() {
        CreateBookingRequest request = new CreateBookingRequest(10L, List.of(100L), 1L, 4L, LocalDate.now().plusDays(1));

        when(scheduleRepository.findById(10L)).thenReturn(Optional.of(schedule));
        when(seatRepository.findById(100L)).thenReturn(Optional.of(seat));
        when(stopRepository.findById(1L)).thenReturn(Optional.of(pickup));
        when(stopRepository.findById(4L)).thenReturn(Optional.of(drop));

        // simulate: this seat already has an active booking on this schedule
        Booking existing = Booking.builder().id(500L).status(Booking.BookingStatus.CONFIRMED).build();
        when(bookingRepository.findActiveForSeatAndSchedule(100L, 10L)).thenReturn(List.of(existing));

        assertThatThrownBy(() -> bookingService.createBooking(passenger, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already reserved");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void bookingFreeSeat_succeeds_andHoldsItWithExpiry() {
        CreateBookingRequest request = new CreateBookingRequest(10L, List.of(100L), 1L, 4L, LocalDate.now().plusDays(1));

        when(scheduleRepository.findById(10L)).thenReturn(Optional.of(schedule));
        when(seatRepository.findById(100L)).thenReturn(Optional.of(seat));
        when(stopRepository.findById(1L)).thenReturn(Optional.of(pickup));
        when(stopRepository.findById(4L)).thenReturn(Optional.of(drop));
        when(bookingRepository.findActiveForSeatAndSchedule(100L, 10L)).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = bookingService.createBooking(passenger, request);

        assertThat(response.bookings()).hasSize(1);
        assertThat(response.bookings().get(0).status()).isEqualTo("PENDING");
        assertThat(response.holdExpiresAt()).isNotNull();
        assertThat(response.bookings().get(0).ticketReference()).startsWith("TCK-");
        verify(eventPublisher).publish(any());
    }

    @Test
    void bookingMultipleSeats_sharesOneGroupRef_andSumsTheFare() {
        CreateBookingRequest request = new CreateBookingRequest(10L, List.of(100L, 101L), 1L, 4L, LocalDate.now().plusDays(1));

        when(scheduleRepository.findById(10L)).thenReturn(Optional.of(schedule));
        when(seatRepository.findById(100L)).thenReturn(Optional.of(seat));
        when(seatRepository.findById(101L)).thenReturn(Optional.of(seat2));
        when(stopRepository.findById(1L)).thenReturn(Optional.of(pickup));
        when(stopRepository.findById(4L)).thenReturn(Optional.of(drop));
        when(bookingRepository.findActiveForSeatAndSchedule(anyLong(), eq(10L))).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = bookingService.createBooking(passenger, request);

        assertThat(response.bookings()).hasSize(2);
        assertThat(response.bookings().get(0).status()).isEqualTo("PENDING");
        assertThat(response.totalFare()).isEqualByComparingTo(BookingService.FLAT_FARE_PER_SEAT.multiply(java.math.BigDecimal.valueOf(2)));
        verify(eventPublisher, times(1)).publish(any()); // one notification for the whole group, not one per seat
    }

    @Test
    void bookingSameSeatTwiceInOneRequest_isRejected() {
        CreateBookingRequest request = new CreateBookingRequest(10L, List.of(100L, 100L), 1L, 4L, LocalDate.now().plusDays(1));

        when(scheduleRepository.findById(10L)).thenReturn(Optional.of(schedule));
        when(stopRepository.findById(1L)).thenReturn(Optional.of(pickup));
        when(stopRepository.findById(4L)).thenReturn(Optional.of(drop));

        assertThatThrownBy(() -> bookingService.createBooking(passenger, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("more than once");
    }
}
