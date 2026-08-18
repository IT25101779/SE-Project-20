package com.busreservation.pattern.schedule;

import com.busreservation.dto.CreateScheduleRequest;
import com.busreservation.entity.Bus;
import com.busreservation.entity.Route;
import com.busreservation.entity.Schedule;
import com.busreservation.repository.BusRepository;
import com.busreservation.repository.RouteRepository;
import com.busreservation.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ============================================================================
 * GOF DESIGN PATTERN: TEMPLATE METHOD (Behavioral Pattern)
 * ============================================================================
 * Owner: Sakalasooriya S.M.Y.V.B. (Scrum Master - Route & Schedule Management)
 * 
 * Intent:
 * Defines the skeleton of the schedule publishing algorithm in this base class,
 * deferring certain route-specific validation steps to concrete subclasses
 * (e.g. ExpresswaySchedulePublisher vs StandardRouteSchedulePublisher).
 *
 * Algorithm Skeleton (publish):
 *   1. fetchAndValidateBus()        (Invariant Step)
 *   2. fetchAndValidateRoute()      (Invariant Step)
 *   3. validateRouteRequirements()  (Primitive / Abstract Hook Step)
 *   4. checkForOverlappingTrips()   (Invariant Step - PBI-10 conflict check)
 *   5. buildAndPersistSchedule()    (Invariant Step)
 *   6. onPublishSuccess()           (Hook Step)
 * ============================================================================
 */
@Slf4j
@RequiredArgsConstructor
public abstract class SchedulePublishingTemplate {

    protected final ScheduleRepository scheduleRepository;
    protected final RouteRepository routeRepository;
    protected final BusRepository busRepository;

    /**
     * The Template Method — declared final so subclasses cannot alter
     * the mandatory sequence of publishing steps.
     */
    @Transactional
    public final Schedule publish(CreateScheduleRequest request) {
        // Step 1: Invariant base validation - verify bus existence & availability
        Bus bus = fetchAndValidateBus(request.busId());

        // Step 2: Invariant base validation - verify route existence
        Route route = fetchAndValidateRoute(request.routeId());

        // Step 3: Abstract Hook Step - specialized validation defined by subclasses
        validateRouteRequirements(bus, route, request);

        // Step 4: Invariant Step - conflict detection (PBI-10: no bus double-booked)
        checkForOverlappingTrips(request.busId(), request.departureTime(), request.arrivalTime());

        // Step 5: Invariant Step - build entity and save
        Schedule schedule = buildAndPersistSchedule(bus, route, request);

        // Step 6: Hook Step - post-publishing notifications or telemetry setup
        onPublishSuccess(schedule);

        return schedule;
    }

    /** Step 1: Base bus validation. */
    protected Bus fetchAndValidateBus(Long busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new IllegalArgumentException("Bus not found with ID: " + busId));
        if (bus.isUnavailable()) {
            throw new IllegalStateException("Bus " + bus.getPlateNumber() + " is currently in maintenance and cannot be scheduled.");
        }
        return bus;
    }

    /** Step 2: Base route validation. */
    protected Route fetchAndValidateRoute(Long routeId) {
        return routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with ID: " + routeId));
    }

    /**
     * Step 3: Abstract Primitive Hook.
     * Concrete subclasses enforce category-specific constraints
     * (e.g., vehicle speed/luxury standards on expressways vs turnaround times on rural routes).
     */
    protected abstract void validateRouteRequirements(Bus bus, Route route, CreateScheduleRequest request);

    /** Step 4: Invariant schedule conflict detection (PBI-10). */
    protected void checkForOverlappingTrips(Long busId, LocalDateTime start, LocalDateTime end) {
        List<Schedule> overlapping = scheduleRepository.findOverlappingForBus(busId, start, end);
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Schedule conflict: Bus is already assigned to " +
                    overlapping.size() + " overlapping trip(s) in this time window.");
        }
    }

    /** Step 5: Save schedule to database. */
    protected Schedule buildAndPersistSchedule(Bus bus, Route route, CreateScheduleRequest request) {
        Schedule schedule = Schedule.builder()
                .bus(bus)
                .route(route)
                .departureTime(request.departureTime())
                .arrivalTime(request.arrivalTime())
                .status(Schedule.ScheduleStatus.SCHEDULED)
                .build();
        return scheduleRepository.save(schedule);
    }

    /** Step 6: Optional Hook method with default implementation. */
    protected void onPublishSuccess(Schedule schedule) {
        log.info("[TemplateMethod:Schedule] Successfully published schedule ID {} for route '{}'",
                schedule.getId(), schedule.getRoute().getName());
    }
}
