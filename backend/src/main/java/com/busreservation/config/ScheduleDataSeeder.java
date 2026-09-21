package com.busreservation.config;

import com.busreservation.entity.Bus;
import com.busreservation.entity.Route;
import com.busreservation.entity.Schedule;
import com.busreservation.repository.BusRepository;
import com.busreservation.repository.RouteRepository;
import com.busreservation.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Seeds demo Schedule rows using plain Java LocalDateTime arithmetic.
 *
 * WHY THIS ISN'T IN data.sql: computing "tomorrow at departure time" needs a
 * date-arithmetic function, and those are NOT portable between H2 and MySQL
 * (MySQL's DATE_ADD()/INTERVAL syntax isn't understood by H2, even in
 * MODE=MySQL). Doing it here in Java sidesteps the whole problem - it's the
 * same code path regardless of which `spring.profiles.active` you run with.
 *
 * Runs as a CommandLineRunner, which executes after data.sql has already
 * run (data.sql clears out any old schedule rows first), so this always
 * leaves the demo with a fresh set of "upcoming" trips relative to whenever
 * the app was started.
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class ScheduleDataSeeder implements CommandLineRunner {

    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (!scheduleRepository.findAll().isEmpty()) {
            return; // already seeded (e.g. app restarted against a persistent MySQL DB)
        }

        Bus bus1 = busRepository.findById(1L).orElse(null);
        Bus bus2 = busRepository.findById(2L).orElse(null);
        Bus bus3 = busRepository.findById(3L).orElse(null);
        Bus bus4 = busRepository.findById(4L).orElse(null);
        Route route1 = routeRepository.findById(1L).orElse(null); // Colombo - Kandy
        Route route2 = routeRepository.findById(2L).orElse(null); // Colombo - Galle
        Route route3 = routeRepository.findById(3L).orElse(null); // Colombo - Jaffna
        Route route4 = routeRepository.findById(4L).orElse(null); // Kandy - Ella

        if (bus1 == null || route1 == null) {
            return; // data.sql hasn't run yet or IDs differ - skip rather than fail startup
        }

        LocalDateTime now = LocalDateTime.now();

        scheduleRepository.save(Schedule.builder()
                .bus(bus1).route(route1)
                .departureTime(now.plusDays(1))
                .arrivalTime(now.plusDays(1).plusHours(3))
                .status(Schedule.ScheduleStatus.SCHEDULED)
                .build());

        scheduleRepository.save(Schedule.builder()
                .bus(bus2).route(route2)
                .departureTime(now.plusDays(1))
                .arrivalTime(now.plusDays(1).plusHours(2).plusMinutes(30))
                .status(Schedule.ScheduleStatus.SCHEDULED)
                .build());

        scheduleRepository.save(Schedule.builder()
                .bus(bus3).route(route3)
                .departureTime(now.plusDays(2))
                .arrivalTime(now.plusDays(2).plusHours(7))
                .status(Schedule.ScheduleStatus.SCHEDULED)
                .build());

        scheduleRepository.save(Schedule.builder()
                .bus(bus4).route(route4)
                .departureTime(now.plusDays(2))
                .arrivalTime(now.plusDays(2).plusHours(5))
                .status(Schedule.ScheduleStatus.SCHEDULED)
                .build());

        // Deliberately "in progress" right now, so TrackingService's simulated
        // GPS job has something to move as soon as the app starts.
        scheduleRepository.save(Schedule.builder()
                .bus(bus1).route(route1)
                .departureTime(now.minusHours(2))
                .arrivalTime(now.plusHours(1))
                .status(Schedule.ScheduleStatus.IN_TRIP)
                .build());
    }
}
