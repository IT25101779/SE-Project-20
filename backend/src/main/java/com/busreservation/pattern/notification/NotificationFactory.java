package com.busreservation.pattern.notification;

import com.busreservation.entity.Notification;
import com.busreservation.entity.User;
import org.springframework.stereotype.Component;

/**
 * DESIGN PATTERN: FACTORY METHOD
 * ---------------------------------------------------------------------------
 * Centralizes the creation of Notification entities so that callers (e.g.
 * BookingService, PaymentService) never construct a Notification directly -
 * they just describe *what* happened, and this factory decides how to build
 * the right object for each channel (SMS / EMAIL / IN_APP), including any
 * channel-specific formatting.
 *
 * Adding a new channel later (e.g. push notifications) means adding one
 * method here, without touching any of the calling services.
 */
@Component
public class NotificationFactory {

    public Notification createBookingConfirmation(User user, Long bookingId, Notification.Channel channel, String ticketRef) {
        return build(user, bookingId, "BOOKING_CONFIRMED", channel,
                formatForChannel(channel, "Your booking " + ticketRef + " is confirmed. Safe travels!"));
    }

    public Notification createPaymentResult(User user, Long bookingId, Notification.Channel channel, boolean success) {
        String msg = success
                ? "Payment received successfully. Your ticket is now confirmed."
                : "Payment failed. Please retry within the seat hold window to keep your seat.";
        return build(user, bookingId, "PAYMENT_RESULT", channel, formatForChannel(channel, msg));
    }

    public Notification createDelayAlert(User user, Long bookingId, Notification.Channel channel, String reason) {
        return build(user, bookingId, "DELAY", channel,
                formatForChannel(channel, "Your bus is delayed. Reason: " + reason));
    }

    public Notification createCancellationAlert(User user, Long bookingId, Notification.Channel channel) {
        return build(user, bookingId, "CANCELLATION", channel,
                formatForChannel(channel, "Your booking " + bookingId + " has been cancelled."));
    }

    public Notification createScheduleChangeAlert(User user, Long bookingId, Notification.Channel channel, String details) {
        return build(user, bookingId, "SCHEDULE_CHANGE", channel, formatForChannel(channel, details));
    }

    public Notification createWaitlistSeatAvailable(User user, Long scheduleId, Notification.Channel channel) {
        return build(user, null, "WAITLIST_SEAT_AVAILABLE", channel,
                formatForChannel(channel, "A seat is now available for schedule #" + scheduleId + ". Book quickly!"));
    }

    private Notification build(User user, Long bookingId, String type, Notification.Channel channel, String message) {
        return Notification.builder()
                .user(user)
                .bookingId(bookingId)
                .type(type)
                .channel(channel)
                .message(message)
                .deliveryStatus(Notification.DeliveryStatus.PENDING)
                .build();
    }

    /** Channel-specific formatting - SMS stays short, email/in-app can be longer. */
    private String formatForChannel(Notification.Channel channel, String message) {
        if (channel == Notification.Channel.SMS && message.length() > 140) {
            return message.substring(0, 137) + "...";
        }
        return message;
    }
}
