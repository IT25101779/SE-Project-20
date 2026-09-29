package com.busreservation.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank(message = "Name is required") String name,
        String phone,
        String preferredLanguage
) {}
