package com.busreservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DelayScheduleRequest(
        @NotNull LocalDateTime revisedDepartureTime,
        @NotBlank String reason
) {}
