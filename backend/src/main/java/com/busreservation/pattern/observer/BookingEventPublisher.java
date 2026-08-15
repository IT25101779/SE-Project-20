package com.busreservation.pattern.observer;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * DESIGN PATTERN: OBSERVER (Subject side)
 * ---------------------------------------------------------------------------
 * Thin, explicit wrapper around Spring's ApplicationEventPublisher (itself an
 * Observer-pattern implementation) so that BookingService/PaymentService
 * publish domain events through one clearly-named class rather than a
 * generic framework type. Listeners subscribe with @EventListener - see
 * NotificationEventListener.
 */
@Component
@RequiredArgsConstructor
public class BookingEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public void publish(BookingEvent event) {
        applicationEventPublisher.publishEvent(event);
    }
}
