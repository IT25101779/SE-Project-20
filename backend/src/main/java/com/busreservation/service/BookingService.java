package com.busreservation.service;

import com.busreservation.config.SystemConfig;
import com.busreservation.dto.BookingGroupResponse;
import com.busreservation.dto.BookingResponse;
import com.busreservation.dto.CreateBookingRequest;
import com.busreservation.entity.*;
import com.busreservation.pattern.observer.BookingEvent;
import com.busreservation.pattern.observer.BookingEventPublisher;
import com.busreservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Core Function: Online Booking with Pickup/Drop Point Selection (owner: Viveka M.C.)
 *
 * Reliability NFR: prevents double-booking by holding each seat (status =
 * PENDING with holdExpiresAt set) until payment completes, and expiring the
 * hold automatically if payment doesn't happen in time - see
 * releaseExpiredHolds(), scheduled in TrackingService's sibling scheduler.
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    /** Demo flat per-seat fare in LKR - kept here (not in PaymentService) so a
     *  group's total can be computed before payment is even attempted. */
    public static final BigDecimal FLAT_FARE_PER_SEAT = new BigDecimal("1500.00");

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final StopRepository stopRepository;
    private final WaitingListRepository waitingListRepository;
    private final BookingEventPublisher eventPublisher;

    /** PBI-02: select 1-6 available seats + a shared pickup/drop point and hold them pending payment. */
    @Transactional
    public BookingGroupResponse createBooking(User passenger, CreateBookingRequest request) {
        Schedule schedule = scheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        Stop pickup = stopRepository.findById(request.pickupStopId())
                .orElseThrow(() -> new IllegalArgumentException("Pickup stop not found"));
        Stop drop = stopRepository.findById(request.dropStopId())
                .orElseThrow(() -> new IllegalArgumentException("Drop stop not found"));

        List<Long> seatIds = request.seatIds().stream().distinct().toList();
        if (seatIds.size() != request.seatIds().size()) {
            throw new IllegalArgumentException("The same seat was selected more than once.");
        }

        // Look up and validate every seat BEFORE creating any booking rows, so
        // a group checkout either fully succeeds or fails with nothing held -
        // no partial group where seat 1 is reserved but seat 2 wasn't available.
        List<Seat> seats = new ArrayList<>();
        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + seatId));
            if (!seat.getBus().getId().equals(schedule.getBus().getId())) {
                throw new IllegalArgumentException("Seat " + seat.getSeatNumber() + " does not belong to this bus.");
            }
            List<Booking> active = bookingRepository.findActiveForSeatAndSchedule(seatId, schedule.getId());
            if (!active.isEmpty()) {
                throw new IllegalStateException("Seat " + seat.getSeatNumber() +
                        " is already reserved for this trip. Choose another seat, or join the waiting list.");
            }
            seats.add(seat);
        }

        SystemConfig config = SystemConfig.getInstance();
        LocalDateTime holdExpiresAt = LocalDateTime.now().plusMinutes(config.getSeatHoldMinutes());
        String groupRef = "GRP-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        List<BookingResponse> responses = new ArrayList<>();
        for (Seat seat : seats) {
            Booking booking = Booking.builder()
                    .passenger(passenger)
                    .schedule(schedule)
                    .seat(seat)
                    .pickupStop(pickup)
                    .dropStop(drop)
                    .travelDate(request.travelDate())
                    .status(Booking.BookingStatus.PENDING)
                    .holdExpiresAt(holdExpiresAt)
                    .ticketReference("TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .groupRef(groupRef)
                    .build();
            booking = bookingRepository.save(booking);
            responses.add(toResponse(booking, null));
        }

        // One notification for the whole group, not one per seat - a
        // passenger booking 4 seats should get a single "4 seats held"
        // message, not four separate ones.
        String detail = responses.size() == 1
                ? responses.get(0).ticketReference()
                : responses.size() + " seats (" + responses.stream().map(BookingResponse::seatNumber).collect(java.util.stream.Collectors.joining(", ")) + ")";
        eventPublisher.publish(new BookingEvent(
                BookingEvent.Type.BOOKING_CREATED, responses.get(0).bookingId(), passenger.getId(), detail));

        BigDecimal totalFare = FLAT_FARE_PER_SEAT.multiply(BigDecimal.valueOf(seats.size()));
        return new BookingGroupResponse(groupRef, responses, totalFare, holdExpiresAt, null);
    }

    /** PBI-07: place an affected/waitlisted passenger on the waiting list for a full service. */
    @Transactional
    public void joinWaitingList(User passenger, Long scheduleId) {
        if (waitingListRepository.existsByScheduleIdAndPassengerId(scheduleId, passenger.getId())) {
            throw new IllegalStateException("You are already on the waiting list for this service.");
        }
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        WaitingList entry = WaitingList.builder().schedule(schedule).passenger(passenger).build();
        waitingListRepository.save(entry);
    }

    /** Cancellation before the cutoff; also offers the freed seat to the next person on the waiting list. */
    @Transactional
    public void cancelBooking(Long bookingId, Long requestingUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        eventPublisher.publish(new BookingEvent(
                BookingEvent.Type.BOOKING_CANCELLED, booking.getId(), booking.getPassenger().getId(), null));

        notifyNextOnWaitingList(booking.getSchedule().getId());
    }

    private void notifyNextOnWaitingList(Long scheduleId) {
        List<WaitingList> waiting = waitingListRepository.findByScheduleIdOrderByRequestedAtAsc(scheduleId);
        waiting.stream().filter(w -> !w.isNotified()).findFirst().ifPresent(next -> {
            next.setNotified(true);
            waitingListRepository.save(next);
            eventPublisher.publish(new BookingEvent(
                    BookingEvent.Type.SEAT_BECAME_AVAILABLE, scheduleId, next.getPassenger().getId(), null));
        });
    }

    /** Scheduled job (see TrackingService) calls this to auto-release expired seat holds. */
    @Transactional
    public void releaseExpiredHolds() {
        List<Booking> expired = bookingRepository.findExpiredHolds(LocalDateTime.now());
        for (Booking booking : expired) {
            booking.setStatus(Booking.BookingStatus.EXPIRED);
            bookingRepository.save(booking);
        }
    }

    public List<Booking> getBookingsForPassenger(Long passengerId) {
        return bookingRepository.findByPassengerIdOrderByCreatedAtDesc(passengerId);
    }

    public BookingResponse toResponse(Booking booking, String qrCodeBase64) {
        return new BookingResponse(
                booking.getId(),
                booking.getStatus().name(),
                booking.getTicketReference(),
                booking.getSeat().getSeatNumber(),
                booking.getPickupStop().getName(),
                booking.getDropStop().getName(),
                booking.getTravelDate(),
                booking.getHoldExpiresAt(),
                qrCodeBase64
        );
    }
}
