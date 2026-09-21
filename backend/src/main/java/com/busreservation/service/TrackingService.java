package com.busreservation.service;

import com.busreservation.dto.FleetTrackingDto;
import com.busreservation.dto.GpsPositionDto;
import com.busreservation.entity.Booking;
import com.busreservation.entity.GpsLog;
import com.busreservation.entity.Schedule;
import com.busreservation.entity.Stop;
import com.busreservation.pattern.observer.BookingEvent;
import com.busreservation.pattern.observer.BookingEventPublisher;
import com.busreservation.repository.BookingRepository;
import com.busreservation.repository.GpsLogRepository;
import com.busreservation.repository.ScheduleRepository;
import com.busreservation.repository.StopRepository;
import com.busreservation.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Core Function: Real-Time Bus Tracking (owner: Weerasekara W.M.A.G.B.)
 *
 * SIMULATED GPS ONLY - see project System Limitations. No real hardware is
 * involved. Position is computed by interpolating, minute by minute, along
 * the straight line between each pair of consecutive stops - proportional
 * to how much of the scheduled travel time has elapsed - rather than
 * snapping instantly from one stop's exact coordinates to the next. This
 * gives a continuously-moving marker and lets ETA/distance be calculated
 * to ANY stop along the route (not just "the next one"), which is what
 * powers both the generic tracking view and each passenger's personal
 * "distance to my stop" view (see getPositionForPassenger).
 */
@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ScheduleRepository scheduleRepository;
    private final StopRepository stopRepository;
    private final GpsLogRepository gpsLogRepository;
    private final BookingRepository bookingRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BookingEventPublisher eventPublisher;
    private final BookingService bookingService;

    /**
     * Runs periodically (see app.simulation.gps-tick-seconds):
     *  1. promotes any SCHEDULED trip whose departure time has arrived to IN_TRIP
     *  2. recomputes + broadcasts + logs every IN_TRIP schedule's interpolated position
     *  3. marks a schedule COMPLETED once it reaches its (possibly delayed) arrival time
     *  4. releases any seat holds whose payment window expired (Reliability NFR)
     */
    @Scheduled(fixedRateString = "${app.simulation.gps-tick-seconds:5}000")
    @Transactional
    public void tickSimulatedGps() {
        LocalDateTime now = LocalDateTime.now();

        for (Schedule schedule : scheduleRepository.findByStatus(Schedule.ScheduleStatus.SCHEDULED)) {
            if (!effectiveDeparture(schedule).isAfter(now)) {
                schedule.setStatus(Schedule.ScheduleStatus.IN_TRIP);
                scheduleRepository.save(schedule);
            }
        }

        for (Schedule schedule : scheduleRepository.findByStatus(Schedule.ScheduleStatus.IN_TRIP)) {
            tickOne(schedule, now);
        }
        for (Schedule schedule : scheduleRepository.findByStatus(Schedule.ScheduleStatus.DELAYED)) {
            tickOne(schedule, now);
        }

        bookingService.releaseExpiredHolds();
    }

    private void tickOne(Schedule schedule, LocalDateTime now) {
        List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(schedule.getRoute().getId());
        if (stops.isEmpty()) return;

        RoutePosition pos = computePosition(schedule, stops, now);

        gpsLogRepository.save(GpsLog.builder()
                .schedule(schedule)
                .latitude(pos.lat)
                .longitude(pos.lon)
                .lastStopIndex(pos.lastPassedStopIndex)
                .build());

        if (pos.arrived) {
            schedule.setStatus(Schedule.ScheduleStatus.COMPLETED);
            scheduleRepository.save(schedule);
            archiveTripGpsLogs(schedule.getId());
        }

        messagingTemplate.convertAndSend("/topic/tracking/" + schedule.getId(),
                toDto(schedule, stops, pos, stops.get(stops.size() - 1)));
    }

    /** PBI-18: an operator/passenger-facing alert whenever a schedule is marked delayed. */
    public void broadcastDelay(Schedule schedule) {
        List<Booking> bookings = bookingRepository.findByScheduleId(schedule.getId());
        for (Booking booking : bookings) {
            if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
                eventPublisher.publish(new BookingEvent(
                        BookingEvent.Type.SCHEDULE_DELAYED, booking.getId(), booking.getPassenger().getId(),
                        schedule.getDelayReason()));
            }
        }
    }

    /** Generic view: ETA/distance are relative to the route's final stop. */
    public GpsPositionDto getLatestPosition(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(schedule.getRoute().getId());
        if (stops.isEmpty()) throw new IllegalStateException("This route has no stops configured yet.");

        RoutePosition pos = computePosition(schedule, stops, LocalDateTime.now());
        return toDto(schedule, stops, pos, stops.get(stops.size() - 1));
    }

    /**
     * Personal view for a passenger: same live position, but ETA/distance
     * are relative to THEIR pickup stop, not the terminus - answers "how
     * far away is my bus, and when will it reach me" rather than just
     * "when does the trip finish".
     */
    public GpsPositionDto getPositionForPassenger(Long scheduleId, Long passengerId) {
        List<Booking> myBookings = bookingRepository.findByPassengerIdAndScheduleId(passengerId, scheduleId);
        Stop myPickup = myBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || b.getStatus() == Booking.BookingStatus.PENDING)
                .findFirst()
                .map(Booking::getPickupStop)
                .orElseThrow(() -> new IllegalStateException("No active booking found for you on this schedule."));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(schedule.getRoute().getId());
        if (stops.isEmpty()) throw new IllegalStateException("This route has no stops configured yet.");

        RoutePosition pos = computePosition(schedule, stops, LocalDateTime.now());
        Stop targetStop = stops.stream().filter(s -> s.getId().equals(myPickup.getId())).findFirst().orElse(myPickup);
        return toDto(schedule, stops, pos, targetStop);
    }

    // -------------------------------------------------------------------
    // Position interpolation
    // -------------------------------------------------------------------

    private LocalDateTime effectiveDeparture(Schedule schedule) {
        return schedule.getRevisedDepartureTime() != null ? schedule.getRevisedDepartureTime() : schedule.getDepartureTime();
    }

    private LocalDateTime effectiveArrival(Schedule schedule) {
        LocalDateTime dep = schedule.getDepartureTime();
        LocalDateTime effDep = effectiveDeparture(schedule);
        Duration delayOffset = Duration.between(dep, effDep);
        return schedule.getArrivalTime().plus(delayOffset);
    }

    /** A snapshot of where the bus is right now, expressed both as coordinates and as progress along the route. */
    private record RoutePosition(double lat, double lon, double distanceTraveledKm, double totalDistanceKm,
                                  int lastPassedStopIndex, boolean departed, boolean arrived,
                                  LocalDateTime effectiveDeparture, LocalDateTime effectiveArrival,
                                  double[] cumulativeKm) {}

    private RoutePosition computePosition(Schedule schedule, List<Stop> stops, LocalDateTime now) {
        double[] cumulativeKm = new double[stops.size()];
        for (int i = 1; i < stops.size(); i++) {
            Stop a = stops.get(i - 1), b = stops.get(i);
            cumulativeKm[i] = cumulativeKm[i - 1] + GeoUtils.distanceKm(a.getLatitude(), a.getLongitude(), b.getLatitude(), b.getLongitude());
        }
        double totalDistanceKm = cumulativeKm[cumulativeKm.length - 1];

        LocalDateTime effDep = effectiveDeparture(schedule);
        LocalDateTime effArr = effectiveArrival(schedule);
        Duration totalDuration = Duration.between(effDep, effArr);
        if (totalDuration.isZero() || totalDuration.isNegative()) totalDuration = Duration.ofMinutes(1);

        Stop first = stops.get(0), last = stops.get(stops.size() - 1);

        if (schedule.getStatus() != Schedule.ScheduleStatus.COMPLETED && now.isBefore(effDep)) {
            return new RoutePosition(first.getLatitude(), first.getLongitude(), 0, totalDistanceKm,
                    -1, false, false, effDep, effArr, cumulativeKm);
        }
        if (schedule.getStatus() == Schedule.ScheduleStatus.COMPLETED || !now.isBefore(effArr)) {
            return new RoutePosition(last.getLatitude(), last.getLongitude(), totalDistanceKm, totalDistanceKm,
                    stops.size() - 1, true, true, effDep, effArr, cumulativeKm);
        }

        double fraction = Duration.between(effDep, now).toMillis() / (double) totalDuration.toMillis();
        double distanceTraveledKm = fraction * totalDistanceKm;

        int idx = 0;
        while (idx < cumulativeKm.length - 2 && cumulativeKm[idx + 1] < distanceTraveledKm) idx++;
        double legStart = cumulativeKm[idx];
        double legEnd = cumulativeKm[Math.min(idx + 1, cumulativeKm.length - 1)];
        double legFraction = legEnd > legStart ? (distanceTraveledKm - legStart) / (legEnd - legStart) : 0;

        Stop a = stops.get(idx);
        Stop b = stops.get(Math.min(idx + 1, stops.size() - 1));
        double lat = a.getLatitude() + (b.getLatitude() - a.getLatitude()) * legFraction;
        double lon = a.getLongitude() + (b.getLongitude() - a.getLongitude()) * legFraction;

        return new RoutePosition(lat, lon, distanceTraveledKm, totalDistanceKm, idx, true, false, effDep, effArr, cumulativeKm);
    }

    private GpsPositionDto toDto(Schedule schedule, List<Stop> stops, RoutePosition pos, Stop targetStop) {
        Long minutesToDeparture = pos.departed() ? null : Duration.between(LocalDateTime.now(), pos.effectiveDeparture()).toMinutes();
        String etaToArrival = (pos.departed() && !pos.arrived())
                ? formatDuration(Duration.between(LocalDateTime.now(), pos.effectiveArrival())) : null;
        double distanceRemainingKm = Math.max(0, pos.totalDistanceKm() - pos.distanceTraveledKm());

        int targetIndex = indexOf(stops, targetStop);
        boolean targetPassed = pos.arrived() || (pos.departed() && targetIndex <= pos.lastPassedStopIndex());

        String etaToTarget = null;
        if (pos.departed() && !targetPassed) {
            double remainingToTargetKm = Math.max(0, pos.cumulativeKm()[targetIndex] - pos.distanceTraveledKm());
            double paceFraction = pos.totalDistanceKm() > 0 ? remainingToTargetKm / pos.totalDistanceKm() : 0;
            Duration totalDuration = Duration.between(pos.effectiveDeparture(), pos.effectiveArrival());
            Duration etaDuration = Duration.ofMillis((long) (totalDuration.toMillis() * paceFraction));
            etaToTarget = formatDuration(etaDuration);
        } else if (!pos.departed()) {
            // Not departed yet: "ETA to your stop" is just departure + scheduled time-to-that-stop.
            double paceFraction = pos.totalDistanceKm() > 0 ? pos.cumulativeKm()[targetIndex] / pos.totalDistanceKm() : 0;
            Duration totalDuration = Duration.between(pos.effectiveDeparture(), pos.effectiveArrival());
            Duration untilTarget = Duration.between(LocalDateTime.now(), pos.effectiveDeparture())
                    .plus(Duration.ofMillis((long) (totalDuration.toMillis() * paceFraction)));
            etaToTarget = formatDuration(untilTarget);
        }

        double distanceToTargetKm = GeoUtils.distanceKm(pos.lat(), pos.lon(), targetStop.getLatitude(), targetStop.getLongitude());

        return new GpsPositionDto(
                schedule.getId(), schedule.getStatus().name(), pos.lat(), pos.lon(),
                minutesToDeparture, etaToArrival, round1(distanceRemainingKm),
                targetStop.getId(), targetStop.getName(), etaToTarget, round1(distanceToTargetKm), targetPassed
        );
    }

    private int indexOf(List<Stop> stops, Stop target) {
        for (int i = 0; i < stops.size(); i++) {
            if (stops.get(i).getId().equals(target.getId())) return i;
        }
        return stops.size() - 1;
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private String formatDuration(Duration d) {
        if (d.isNegative()) d = Duration.ZERO;
        long h = d.toHours();
        long m = d.toMinutesPart();
        return h > 0 ? h + "h " + m + "m" : m + "m";
    }

    /**
     * CRUD - CREATE & UPDATE:
     * Logs an explicit GPS update from the tracking device or simulator,
     * dynamically recomputes the ETA to upcoming stops, and broadcasts to live clients.
     */
    @Transactional
    public GpsPositionDto logPositionUpdate(Long scheduleId, double lat, double lon, Double speedKmH) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(schedule.getRoute().getId());
        if (stops.isEmpty()) throw new IllegalStateException("Route has no stops");

        int closestIndex = 0;
        double minDistance = Double.MAX_VALUE;
        for (int i = 0; i < stops.size(); i++) {
            Stop s = stops.get(i);
            double dist = GeoUtils.distanceKm(lat, lon, s.getLatitude(), s.getLongitude());
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = i;
            }
        }

        gpsLogRepository.save(GpsLog.builder()
                .schedule(schedule)
                .latitude(lat)
                .longitude(lon)
                .speedKmH(speedKmH != null ? speedKmH : 50.0)
                .lastStopIndex(closestIndex)
                .archived(false)
                .build());

        Stop terminus = stops.get(stops.size() - 1);
        double distanceRemainingKm = GeoUtils.distanceKm(lat, lon, terminus.getLatitude(), terminus.getLongitude());
        double speed = (speedKmH != null && speedKmH > 5.0) ? speedKmH : 45.0;
        long minutesRemaining = Math.max(1, Math.round((distanceRemainingKm / speed) * 60.0));
        String dynamicEta = minutesRemaining > 60
                ? (minutesRemaining / 60) + "h " + (minutesRemaining % 60) + "m"
                : minutesRemaining + "m";

        if (schedule.getStatus() == Schedule.ScheduleStatus.SCHEDULED) {
            schedule.setStatus(Schedule.ScheduleStatus.IN_TRIP);
            scheduleRepository.save(schedule);
        }

        boolean arrived = minDistance < 0.5 && closestIndex == stops.size() - 1;
        if (arrived) {
            schedule.setStatus(Schedule.ScheduleStatus.COMPLETED);
            scheduleRepository.save(schedule);
            archiveTripGpsLogs(schedule.getId());
        }

        GpsPositionDto dto = new GpsPositionDto(
                schedule.getId(),
                schedule.getStatus().name(),
                lat,
                lon,
                null,
                dynamicEta,
                round1(distanceRemainingKm),
                terminus.getId(),
                terminus.getName(),
                dynamicEta,
                round1(distanceRemainingKm),
                arrived
        );

        messagingTemplate.convertAndSend("/topic/tracking/" + schedule.getId(), dto);
        messagingTemplate.convertAndSend("/topic/tracking/fleet", dto);

        return dto;
    }

    /**
     * CRUD - READ (ADMIN):
     * Retrieves live tracking snapshot of all fleet buses, current coordinates, ETA, and progress.
     */
    public List<FleetTrackingDto> getFleetTrackingOverview() {
        List<Schedule> schedules = scheduleRepository.findAll();
        List<FleetTrackingDto> list = new java.util.ArrayList<>();

        for (Schedule s : schedules) {
            List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(s.getRoute().getId());
            if (stops.isEmpty()) continue;

            GpsPositionDto pos = getLatestPosition(s.getId());
            long totalLogs = gpsLogRepository.countByScheduleId(s.getId());
            long archivedLogs = gpsLogRepository.countByScheduleIdAndArchivedTrue(s.getId());
            boolean isArchived = totalLogs > 0 && totalLogs == archivedLogs;

            double totalRouteKm = s.getRoute().getDistanceKm() > 0 ? s.getRoute().getDistanceKm() : 100.0;
            double remainingKm = pos.distanceRemainingKm();
            double progress = Math.min(100.0, Math.max(0.0, Math.round(((totalRouteKm - remainingKm) / totalRouteKm) * 100.0)));
            if (s.getStatus() == Schedule.ScheduleStatus.COMPLETED) {
                progress = 100.0;
            }

            var latestLog = gpsLogRepository.findTopByScheduleIdOrderByTimestampDesc(s.getId());
            Double speed = latestLog.map(GpsLog::getSpeedKmH).orElse(s.getStatus() == Schedule.ScheduleStatus.IN_TRIP ? 52.0 : 0.0);

            list.add(new FleetTrackingDto(
                    s.getId(),
                    s.getBus().getPlateNumber(),
                    s.getBus().getBusType(),
                    s.getBus().getDriverName() != null ? s.getBus().getDriverName() : "Driver Assigned",
                    s.getRoute().getName(),
                    s.getStatus().name(),
                    pos.latitude(),
                    pos.longitude(),
                    speed,
                    pos.etaToArrival(),
                    pos.distanceRemainingKm(),
                    progress,
                    totalLogs,
                    isArchived
            ));
        }

        return list;
    }

    /**
     * CRUD - DELETE / ARCHIVE:
     * Marks all location history records for a completed trip as archived.
     */
    @Transactional
    public int archiveTripGpsLogs(Long scheduleId) {
        return gpsLogRepository.archiveByScheduleId(scheduleId);
    }

    /**
     * CRUD - PURGE ARCHIVED:
     * Hard-deletes archived GPS history for a completed trip.
     */
    @Transactional
    public int purgeTripGpsLogs(Long scheduleId) {
        return gpsLogRepository.purgeArchivedByScheduleId(scheduleId);
    }
}
