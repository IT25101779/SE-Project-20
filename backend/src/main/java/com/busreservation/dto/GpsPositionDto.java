package com.busreservation.dto;

/**
 * Live position + ETA for one schedule. "targetStop" is context-dependent:
 * for the generic /api/tracking/{id} endpoint it's the route's final stop;
 * for /api/tracking/{id}/mine it's the calling passenger's own pickup stop
 * (pulled from their booking) - so a passenger sees "how long until MY
 * stop", not just "how long until the terminus".
 */
public record GpsPositionDto(
        Long scheduleId,
        String scheduleStatus,        // SCHEDULED, IN_TRIP, DELAYED, COMPLETED, CANCELLED
        double latitude,
        double longitude,
        Long minutesToDeparture,      // null once the trip has actually departed
        String etaToArrival,          // formatted; null if not yet departed or already completed
        double distanceRemainingKm,   // current position -> final stop

        Long targetStopId,
        String targetStopName,
        String etaToTargetStop,       // formatted; null if not yet departed or already passed
        double distanceToTargetStopKm,
        boolean targetStopAlreadyPassed
) {}
