package com.busreservation.dto;

import jakarta.validation.constraints.NotBlank;

public record RefundDecisionRequest(
        boolean approved,
        @NotBlank String reason
) {}
