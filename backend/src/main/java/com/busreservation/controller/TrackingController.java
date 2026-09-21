package com.busreservation.controller;

import com.busreservation.dto.GpsPositionDto;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Core Function: Real-Time Bus Tracking (owner: Weerasekara W.M.A.G.B.) - SIMULATED GPS. */
@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;
    private final CurrentUserProvider currentUserProvider;

    /** PBI-03/PBI-17: current position + ETA to the final stop (also pushed live over WebSocket at /topic/tracking/{scheduleId}). */
    @GetMapping("/{scheduleId}")
    public GpsPositionDto getPosition(@PathVariable Long scheduleId) {
        return trackingService.getLatestPosition(scheduleId);
    }

    /**
     * Same live position, but ETA/distance are relative to the calling
     * passenger's OWN pickup stop (looked up from their booking), not the
     * route's terminus - "how far is my bus, and when will it reach me".
     */
    @GetMapping("/{scheduleId}/mine")
    public GpsPositionDto getPositionForMe(@PathVariable Long scheduleId) {
        var passenger = currentUserProvider.getCurrentUser();
        return trackingService.getPositionForPassenger(scheduleId, passenger.getId());
    }

    /**
     * CRUD - CREATE & UPDATE:
     * Tracking device or driver simulator logs a new GPS coordinate ping.
     * Recomputes real-time ETA and broadcasts to passengers.
     */
    @org.springframework.web.bind.annotation.PostMapping("/{scheduleId}/ping")
    public GpsPositionDto logGpsPing(
            @PathVariable Long scheduleId,
            @org.springframework.web.bind.annotation.RequestBody GpsPingRequest request) {
        return trackingService.logPositionUpdate(
                scheduleId,
                request.latitude(),
                request.longitude(),
                request.speedKmH()
        );
    }

    /**
     * CRUD - READ (ADMIN):
     * Retrieves real-time GPS locations, speed, and ETAs for all buses across the fleet.
     */
    @GetMapping("/fleet")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_STAFF')")
    public java.util.List<com.busreservation.dto.FleetTrackingDto> getFleetOverview() {
        return trackingService.getFleetTrackingOverview();
    }

    /**
     * CRUD - DELETE / ARCHIVE:
     * Archive location history once a trip is completed.
     */
    @org.springframework.web.bind.annotation.PostMapping("/schedules/{scheduleId}/archive")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_STAFF')")
    public java.util.Map<String, Object> archiveTripGps(@PathVariable Long scheduleId) {
        int count = trackingService.archiveTripGpsLogs(scheduleId);
        return java.util.Map.of("success", true, "archivedCount", count, "scheduleId", scheduleId);
    }

    /**
     * CRUD - PURGE ARCHIVED:
     * Purge archived location logs.
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/schedules/{scheduleId}/logs")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_STAFF')")
    public java.util.Map<String, Object> purgeTripGps(@PathVariable Long scheduleId) {
        int count = trackingService.purgeTripGpsLogs(scheduleId);
        return java.util.Map.of("success", true, "purgedCount", count, "scheduleId", scheduleId);
    }

    public record GpsPingRequest(double latitude, double longitude, Double speedKmH) {}
}
