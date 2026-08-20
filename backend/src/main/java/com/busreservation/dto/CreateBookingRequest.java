package com.busreservation.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * One checkout can cover several seats at once (e.g. a group travelling
 * together) - they all share one pickup/drop point and are held/paid for
 * together, but each still gets its own Booking row and its own QR ticket.
 */
public record CreateBookingRequest(
        @NotNull Long scheduleId,
        @NotEmpty @Size(max = 6, message = "You can book at most 6 seats at once.") List<Long> seatIds,
        @NotNull Long pickupStopId,
        @NotNull Long dropStopId,
        @NotNull LocalDate travelDate
) {}
