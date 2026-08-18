package com.busreservation.pattern.schedule;

import com.busreservation.entity.Route;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Resolver / Factory for Schedule Publishing Template Implementations.
 * Directs the schedule creation request to the appropriate template subclass
 * depending on whether the route operates over an expressway or a standard corridor.
 */
@Component
@RequiredArgsConstructor
public class SchedulePublisherFactory {

    private final ExpresswaySchedulePublisher expresswayPublisher;
    private final StandardRouteSchedulePublisher standardRoutePublisher;

    /**
     * Resolves the appropriate Template Method implementation.
     * Routes with 'Expressway', 'Highway', or 'E0' corridor codes use ExpresswaySchedulePublisher.
     */
    public SchedulePublishingTemplate resolve(Route route) {
        if (route != null && route.getName() != null) {
            String name = route.getName().toLowerCase();
            if (name.contains("expressway") || name.contains("highway") || name.contains("e01") || name.contains("e02") || name.contains("e04")) {
                return expresswayPublisher;
            }
        }
        return standardRoutePublisher;
    }
}
