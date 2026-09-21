package com.busreservation.pattern.observer;

import com.busreservation.entity.User;
import com.busreservation.repository.UserRepository;
import com.busreservation.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * DESIGN PATTERN: OBSERVER (Observer/Listener side)
 * ---------------------------------------------------------------------------
 * Reacts to BookingEvent publications by triggering the appropriate
 * notification. BookingService and PaymentService have NO idea this class
 * exists - they only publish events through BookingEventPublisher. This
 * decoupling means the Waiting List module (or a future analytics module)
 * could add its own listener for the same events without touching booking
 * or payment code at all.
 */
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @TransactionalEventListener
    public void onBookingEvent(BookingEvent event) {
        User passenger = userRepository.findById(event.passengerId()).orElse(null);
        if (passenger == null) return;

        switch (event.type()) {
            case BOOKING_CREATED ->
                    notificationService.sendBookingConfirmation(passenger, event.bookingId(), event.detail());
            case PAYMENT_SUCCEEDED ->
                    notificationService.sendPaymentResult(passenger, event.bookingId(), true);
            case PAYMENT_FAILED ->
                    notificationService.sendPaymentResult(passenger, event.bookingId(), false);
            case SCHEDULE_DELAYED ->
                    notificationService.sendDelayAlert(passenger, event.bookingId(), event.detail());
            case SEAT_BECAME_AVAILABLE ->
                    notificationService.sendWaitlistSeatAvailable(passenger, event.bookingId());
            case BOOKING_CANCELLED -> {
                // No-op for now - cancellation confirmation could be added the same way.
            }
        }
    }
}
