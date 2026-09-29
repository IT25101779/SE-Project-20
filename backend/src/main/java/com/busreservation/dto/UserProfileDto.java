package com.busreservation.dto;

import com.busreservation.entity.Role;
import java.time.LocalDateTime;

public record UserProfileDto(
        Long id,
        String name,
        String email,
        String phone,
        Role role,
        String preferredLanguage,
        boolean active,
        LocalDateTime createdAt,
        long totalBookings
) {}
