package com.busreservation.controller;

import com.busreservation.entity.Booking;
import com.busreservation.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Core Function ownership: Customer Service Officer persona (owner: Wijewardana D.S.) */
@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN')")
public class SupportController {

    private final BookingRepository bookingRepository;

    /** PBI-05: locate a passenger's booking using an approved identifier (ticket reference). */
    @GetMapping("/bookings/lookup")
    public Booking lookup(@RequestParam String ticketReference) {
        return bookingRepository.findByTicketReference(ticketReference)
                .orElseThrow(() -> new IllegalArgumentException("No booking found for reference " + ticketReference));
    }

    // PBI-06 (record a passenger complaint) and PBI-08 (resend a notification) are
    // handled by NotificationController's /api/support/notifications/{id}/resend
    // endpoint and a simple Complaint entity would extend this controller in the
    // next iteration - left as a clearly-scoped follow-up (see README "Next Steps").
}
