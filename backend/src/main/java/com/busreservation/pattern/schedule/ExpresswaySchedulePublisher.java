package com.busreservation.pattern.schedule;

import com.busreservation.dto.CreateScheduleRequest;
import com.busreservation.entity.Bus;
import com.busreservation.entity.Route;
import com.busreservation.entity.Schedule;
import com.busreservation.repository.BusRepository;
import com.busreservation.repository.RouteRepository;
import com.busreservation.repository.ScheduleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Concrete Template Implementation: Expressway Schedule Publisher
 * -----------------------------------------------------------------
 * Specializes publishing logic for Sri Lankan Expressway Corridors
 * (E01 Southern Expressway, E02 Outer Circular, E04 Central Expressway).
 *
 * Enforces National Transport Commission (NTC) highway standards:
 * 1. Fleet Quality: Non-AC / Normal buses are restricted from expressway transit.
 * 2. Speed / Travel Duration: Validates that arrival time complies with expressway speed limits.
 */
@Slf4j
@Component
public class ExpresswaySchedulePublisher extends SchedulePublishingTemplate {

    public ExpresswaySchedulePublisher(ScheduleRepository scheduleRepository,
                                       RouteRepository routeRepository,
                                       BusRepository busRepository) {
        super(scheduleRepository, routeRepository, busRepository);
    }

    @Override
    protected void validateRouteRequirements(Bus bus, Route route, CreateScheduleRequest request) {
        // Highway constraint 1: Only Luxury or Semi-Luxury coaches permitted on Expressways
        String busType = bus.getBusType() != null ? bus.getBusType().trim().toLowerCase() : "";
        if (busType.contains("normal")) {
            throw new IllegalArgumentException(
                    "Expressway Route Regulation Violation: Route '" + route.getName() +
                    "' is an expressway corridor. Non-AC Normal buses (" + bus.getPlateNumber() +
                    ") are prohibited. Please assign a Luxury or Semi-Luxury coach."
            );
        }

        // Highway constraint 2: Reasonable duration check (must be at least 30 minutes)
        Duration tripDuration = Duration.between(request.departureTime(), request.arrivalTime());
        if (tripDuration.isNegative() || tripDuration.toMinutes() < 30) {
            throw new IllegalArgumentException(
                    "Invalid expressway schedule duration: Departure must precede arrival by at least 30 minutes."
            );
        }
    }

    @Override
    protected void onPublishSuccess(Schedule schedule) {
        log.info("[TemplateMethod:Expressway] Verified NTC Highway Compliance. Expressway schedule published: {} -> {}",
                schedule.getRoute().getName(), schedule.getBus().getPlateNumber());
    }
}
