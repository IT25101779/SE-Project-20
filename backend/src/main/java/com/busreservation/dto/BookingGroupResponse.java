package com.busreservation.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * What a multi-seat checkout returns: one seat hold per Booking row, but
 * grouped together under one groupRef so the frontend can show "3 seats
 * held, pay once" instead of three separate payment steps.
 */
public record BookingGroupResponse(
        String groupRef,
        List<BookingResponse> bookings,
        BigDecimal totalFare,
        LocalDateTime holdExpiresAt,
        String paymentFailureReason // null unless a payment attempt on this group just failed
) {}
