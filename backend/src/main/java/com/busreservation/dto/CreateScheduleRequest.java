package com.busreservation.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreateScheduleRequest(
        @NotNull Long busId,
        @NotNull Long routeId,
        @NotNull LocalDateTime departureTime,
        @NotNull LocalDateTime arrivalTime
) {}
