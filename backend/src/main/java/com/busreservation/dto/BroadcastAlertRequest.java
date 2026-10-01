package com.busreservation.dto;

import com.busreservation.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Core Function: Notification & Alert Management (owner: Wijewardana D.S.)
 *
 * Payload for support staff broadcasting trip delay, weather, or advisory alerts
 * to all passengers booked on a particular schedule.
 */
public record BroadcastAlertRequest(
        @NotNull(message = "Schedule ID is required")
        Long scheduleId,

        @NotBlank(message = "Message text cannot be blank")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        String message,

        Notification.Channel channel
) {}
