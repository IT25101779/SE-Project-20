package com.busreservation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(
        Long bookingId,
        String status,
        String ticketReference,
        String seatNumber,
        String pickupStopName,
        String dropStopName,
        LocalDate travelDate,
        LocalDateTime holdExpiresAt,
        String qrCodeBase64 // null until payment confirmed
) {}
