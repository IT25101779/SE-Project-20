package com.busreservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Core Function: Notification & Alert Management (owner: Wijewardana D.S.)
 *
 * Payload for support staff updating/editing an existing notification message.
 */
public record UpdateNotificationRequest(
        @NotBlank(message = "Notification message cannot be blank")
        @Size(max = 1000, message = "Notification message must not exceed 1000 characters")
        String message
) {}
