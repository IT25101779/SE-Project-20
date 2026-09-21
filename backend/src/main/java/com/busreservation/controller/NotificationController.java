package com.busreservation.controller;

import com.busreservation.entity.Notification;
import com.busreservation.entity.User;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Core Function: Notification & Alert Management (owner: Wijewardana D.S.) - MOCK SEND. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/notifications/mine")
    public List<Notification> mine() {
        User user = currentUserProvider.getCurrentUser();
        return notificationService.getForUser(user.getId());
    }

    /** Support Staff: inspect all delivery logs. */
    @GetMapping("/support/notifications")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN')")
    public List<Notification> getAllDeliveryLogs() {
        return notificationService.getAllDeliveryLogs();
    }

    /** Support Staff: resend / retry a notification with a chosen channel (SMS, EMAIL, IN_APP). */
    @PostMapping("/support/notifications/{id}/retry")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN')")
    public Notification retry(
            @PathVariable Long id,
            @RequestParam(required = false) Notification.Channel channel) {
        return notificationService.retryWithChannel(id, channel);
    }

    /** PBI-08: Support Staff resends a booking confirmation/notification (legacy endpoint). */
    @PostMapping("/support/notifications/{id}/resend")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN')")
    public Notification resend(@PathVariable Long id) {
        return notificationService.resend(id);
    }

    /** Support Staff: broadcast custom trip delay / advisory alert to all booked passengers. */
    @PostMapping("/support/notifications/broadcast")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN')")
    public java.util.Map<String, Object> broadcast(
            @RequestParam Long scheduleId,
            @RequestParam String message,
            @RequestParam(required = false) Notification.Channel channel) {
        int count = notificationService.broadcastScheduleAlert(scheduleId, message, channel);
        return java.util.Map.of("success", true, "notifiedCount", count, "message", message);
    }

    /** Support Staff: delete notification delivery log. */
    @DeleteMapping("/support/notifications/{id}")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN')")
    public void deleteBySupport(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }

    /** Proposal Notification Delete: archive / delete an old or dismiss notification. */
    @DeleteMapping("/notifications/{id}")
    public void delete(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}

