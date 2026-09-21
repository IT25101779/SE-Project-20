package com.busreservation.service;

import com.busreservation.entity.Notification;
import com.busreservation.entity.User;
import com.busreservation.pattern.notification.NotificationFactory;
import com.busreservation.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Core Function: Notification & Alert Management (owner: Wijewardana D.S.)
 *
 * IMPORTANT: SMS/Email sending is MOCKED for this academic prototype (see
 * System Limitations). Every "send" is logged with a delivery status so the
 * Support Staff delivery-log view (PBI: resend a failed notification) still
 * has something real to work with.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationFactory notificationFactory;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.busreservation.repository.BookingRepository bookingRepository;

    @Transactional
    public void sendBookingConfirmation(User user, Long bookingId, String ticketRef) {
        sendOnAllChannels(user, bookingId,
                Notification.Channel.IN_APP,
                (u, b, c) -> notificationFactory.createBookingConfirmation(u, b, c, ticketRef));
    }

    @Transactional
    public void sendPaymentResult(User user, Long bookingId, boolean success) {
        sendOnAllChannels(user, bookingId,
                Notification.Channel.IN_APP,
                (u, b, c) -> notificationFactory.createPaymentResult(u, b, c, success));
    }

    @Transactional
    public void sendDelayAlert(User user, Long bookingId, String reason) {
        sendOnAllChannels(user, bookingId,
                Notification.Channel.IN_APP,
                (u, b, c) -> notificationFactory.createDelayAlert(u, b, c, reason));
    }

    @Transactional
    public void sendWaitlistSeatAvailable(User user, Long scheduleId) {
        Notification n = notificationFactory.createWaitlistSeatAvailable(user, scheduleId, Notification.Channel.IN_APP);
        deliver(n);
    }

    public List<Notification> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllDeliveryLogs() {
        return notificationRepository.findAllByOrderBySentAtDesc();
    }

    /** Support Staff: resend a notification with same channel. */
    @Transactional
    public Notification resend(Long notificationId) {
        return retryWithChannel(notificationId, null);
    }

    /** Support Staff: retry a notification with a chosen channel (SMS, EMAIL, IN_APP). */
    @Transactional
    public Notification retryWithChannel(Long notificationId, Notification.Channel channel) {
        Notification original = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        Notification.Channel targetChannel = channel != null ? channel : original.getChannel();
        Notification copy = Notification.builder()
                .user(original.getUser())
                .bookingId(original.getBookingId())
                .type(original.getType())
                .channel(targetChannel)
                .message(original.getMessage())
                .deliveryStatus(Notification.DeliveryStatus.PENDING)
                .build();
        return deliver(copy);
    }


    /** Support Staff: broadcast custom trip delay / advisory alert to all booked passengers. */
    @Transactional
    public int broadcastScheduleAlert(Long scheduleId, String message, Notification.Channel channel) {
        List<com.busreservation.entity.Booking> bookings = bookingRepository.findByScheduleId(scheduleId);
        java.util.Set<Long> notifiedUserIds = new java.util.HashSet<>();
        int count = 0;
        Notification.Channel targetChannel = channel != null ? channel : Notification.Channel.IN_APP;

        for (com.busreservation.entity.Booking booking : bookings) {
            User passenger = booking.getPassenger();
            if (passenger != null && notifiedUserIds.add(passenger.getId())) {
                Notification n = Notification.builder()
                        .user(passenger)
                        .bookingId(booking.getId())
                        .type("DELAY_ALERT")
                        .channel(targetChannel)
                        .message(message)
                        .deliveryStatus(Notification.DeliveryStatus.PENDING)
                        .build();
                deliver(n);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }


    private void sendOnAllChannels(User user, Long bookingId, Notification.Channel primary, NotificationBuilder builder) {

        // Demo simplification: send in-app always; a real system would also
        // check user notification preferences before sending SMS/Email.
        deliver(builder.build(user, bookingId, primary));
    }

    private Notification deliver(Notification notification) {
        // MOCK SEND: in a real system this calls an SMS/Email provider.
        notification.setDeliveryStatus(Notification.DeliveryStatus.SENT);
        Notification saved = notificationRepository.save(notification);

        // Push live to the frontend over WebSocket if the user is connected.
        messagingTemplate.convertAndSend("/topic/notifications/" + saved.getUser().getId(), saved);
        return saved;
    }

    @FunctionalInterface
    private interface NotificationBuilder {
        Notification build(User user, Long bookingId, Notification.Channel channel);
    }
}
