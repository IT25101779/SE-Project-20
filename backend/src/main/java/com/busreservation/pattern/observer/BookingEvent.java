package com.busreservation.pattern.observer;

/**
 * DESIGN PATTERN: OBSERVER
 * ---------------------------------------------------------------------------
 * Describes something that just happened to a booking. Published by
 * BookingService / PaymentService via BookingEventPublisher, and consumed by
 * any number of listeners (currently NotificationEventListener) without the
 * publisher needing to know who's listening.
 *
 * This is what lets "create a booking" and "confirm a payment" trigger
 * notifications automatically, and lets a future feature (e.g. analytics
 * logging) subscribe to the same events later without changing
 * BookingService or PaymentService at all.
 */
public record BookingEvent(Type type, Long bookingId, Long passengerId, String detail) {

    public enum Type {
        BOOKING_CREATED,
        PAYMENT_SUCCEEDED,
        PAYMENT_FAILED,
        BOOKING_CANCELLED,
        SEAT_BECAME_AVAILABLE,
        SCHEDULE_DELAYED
    }
}
