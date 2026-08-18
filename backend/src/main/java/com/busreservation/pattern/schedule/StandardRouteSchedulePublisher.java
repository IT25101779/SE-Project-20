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
 * Concrete Template Implementation: Standard Route Schedule Publisher
 * ---------------------------------------------------------------------
 * Specializes publishing logic for Standard Provincial Routes & Arterial Corridors
 * (e.g., A1 Colombo-Kandy, A2 Galle Road, A9 Kandy-Jaffna).
 *
 * Characteristics:
 * - All bus categories (Normal, Semi-Luxury, Luxury) are permissible.
 * - Enforces minimum 45-minute travel window for provincial journeys.
 */
@Slf4j
@Component
public class StandardRouteSchedulePublisher extends SchedulePublishingTemplate {

    public StandardRouteSchedulePublisher(ScheduleRepository scheduleRepository,
                                         RouteRepository routeRepository,
                                         BusRepository busRepository) {
        super(scheduleRepository, routeRepository, busRepository);
    }

    @Override
    protected void validateRouteRequirements(Bus bus, Route route, CreateScheduleRequest request) {
        // Standard arterial route timing check
        Duration tripDuration = Duration.between(request.departureTime(), request.arrivalTime());
        if (tripDuration.isNegative() || tripDuration.toMinutes() < 15) {
            throw new IllegalArgumentException(
                    "Standard route timing error: Departure must precede arrival by at least 15 minutes."
            );
        }
    }

    @Override
    protected void onPublishSuccess(Schedule schedule) {
        log.info("[TemplateMethod:StandardRoute] Standard provincial schedule published successfully: ID={}, Route={}",
                schedule.getId(), schedule.getRoute().getName());
    }
}
