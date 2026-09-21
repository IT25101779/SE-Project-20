package com.busreservation.controller;

import com.busreservation.dto.BookingGroupResponse;
import com.busreservation.dto.BookingResponse;
import com.busreservation.dto.CreateBookingRequest;
import com.busreservation.entity.Booking;
import com.busreservation.entity.User;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Core Function: Online Booking with Pickup/Drop Point Selection (owner: Viveka M.C.) */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserProvider currentUserProvider;

    /** PBI-02: select a seat + pickup/drop point and hold it pending payment. */
    @PostMapping
    public BookingGroupResponse create(@Valid @RequestBody CreateBookingRequest request) {
        User passenger = currentUserProvider.getCurrentUser();
        return bookingService.createBooking(passenger, request);
    }

    @GetMapping("/mine")
    public List<Booking> myBookings() {
        User passenger = currentUserProvider.getCurrentUser();
        return bookingService.getBookingsForPassenger(passenger.getId());
    }

    /** PBI-07: join the waiting list for a fully booked schedule. */
    @PostMapping("/waiting-list/{scheduleId}")
    public void joinWaitingList(@PathVariable Long scheduleId) {
        User passenger = currentUserProvider.getCurrentUser();
        bookingService.joinWaitingList(passenger, scheduleId);
    }

    @DeleteMapping("/{id}")
    public void cancel(@PathVariable Long id) {
        User user = currentUserProvider.getCurrentUser();
        bookingService.cancelBooking(id, user.getId());
    }
}
