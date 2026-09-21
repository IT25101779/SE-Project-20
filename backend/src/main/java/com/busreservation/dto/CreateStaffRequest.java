package com.busreservation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.busreservation.entity.Role;

public record CreateStaffRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        String phone,
        @NotBlank String password,
        @NotNull Role role
) {}
