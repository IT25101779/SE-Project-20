package com.busreservation.service;

import com.busreservation.dto.*;
import com.busreservation.entity.*;
import com.busreservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core Function: Search & Route/Schedule Management (owner: Sakalasooriya S.M.Y.V.B.)
 * Handles passenger-facing search plus admin schedule publishing with
 * conflict detection (PBI-10: no bus double-booked into overlapping trips).
 */
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final StopRepository stopRepository;
    private final com.busreservation.repository.ReviewRepository reviewRepository;

    /** PBI-01: search available bus services by route, date, and time. */
    @Transactional(readOnly = true)
    public List<ScheduleSearchResult> search(String origin, String destination, LocalDateTime date) {
        LocalDateTime dayStart = date.toLocalDate().atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);
        List<Schedule> schedules = scheduleRepository.search(origin, destination, dayStart, dayEnd);
        return schedules.stream().map(this::toSearchResult).collect(Collectors.toList());
    }

    /** PBI-09 / PBI-10: publish a schedule, blocking it if it conflicts with an existing one. */
    @Transactional
    public Schedule publishSchedule(CreateScheduleRequest request) {
        Bus bus = busRepository.findById(request.busId())
                .orElseThrow(() -> new IllegalArgumentException("Bus not found"));
        if (bus.isUnavailable()) {
            throw new IllegalStateException("This bus is currently marked unavailable and cannot be scheduled.");
        }
        Route route = routeRepository.findById(request.routeId())
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        checkForConflicts(request.busId(), request.departureTime(), request.arrivalTime());

        Schedule schedule = Schedule.builder()
                .bus(bus)
                .route(route)
                .departureTime(request.departureTime())
                .arrivalTime(request.arrivalTime())
                .status(Schedule.ScheduleStatus.SCHEDULED)
                .build();
        return scheduleRepository.save(schedule);
    }

    /** PBI-10: conflict warning before publishing - same bus double-booked into overlapping trips. */
    private void checkForConflicts(Long busId, LocalDateTime start, LocalDateTime end) {
        List<Schedule> overlapping = scheduleRepository.findOverlappingForBus(busId, start, end);
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Schedule conflict: this bus is already assigned to " +
                    overlapping.size() + " overlapping trip(s) in this time window.");
        }
    }

    /** PBI-11: record a revised departure time and reason for a delayed service. */
    @Transactional
    public Schedule recordDelay(Long scheduleId, DelayScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        schedule.setRevisedDepartureTime(request.revisedDepartureTime());
        schedule.setDelayReason(request.reason());
        schedule.setStatus(Schedule.ScheduleStatus.DELAYED);
        return scheduleRepository.save(schedule);
    }

    /** PBI-12: nominate a replacement bus for a cancelled schedule. */
    @Transactional
    public Schedule assignReplacementBus(Long scheduleId, Long newBusId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        Bus newBus = busRepository.findById(newBusId)
                .orElseThrow(() -> new IllegalArgumentException("Replacement bus not found"));
        if (newBus.isUnavailable()) {
            throw new IllegalStateException("The nominated replacement bus is marked unavailable.");
        }
        checkForConflicts(newBusId, schedule.getDepartureTime(), schedule.getArrivalTime());
        schedule.setBus(newBus);
        schedule.setStatus(Schedule.ScheduleStatus.SCHEDULED);
        return scheduleRepository.save(schedule);
    }

    public List<ScheduleSearchResult> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(this::toSearchResult)
                .collect(Collectors.toList());
    }

    @Transactional
    public Schedule updateSchedule(Long scheduleId, CreateScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
        Bus bus = busRepository.findById(request.busId())
                .orElseThrow(() -> new IllegalArgumentException("Bus not found"));
        if (bus.isUnavailable()) {
            throw new IllegalStateException("This bus is currently marked unavailable and cannot be scheduled.");
        }
        Route route = routeRepository.findById(request.routeId())
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        List<Schedule> overlapping = scheduleRepository.findOverlappingForBus(request.busId(), request.departureTime(), request.arrivalTime())
                .stream().filter(s -> !s.getId().equals(scheduleId)).toList();
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Schedule conflict: this bus is already assigned to " +
                    overlapping.size() + " overlapping trip(s) in this time window.");
        }

        schedule.setBus(bus);
        schedule.setRoute(route);
        schedule.setDepartureTime(request.departureTime());
        schedule.setArrivalTime(request.arrivalTime());
        return scheduleRepository.save(schedule);
    }


    @Transactional
    public void deleteSchedule(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }

    /** Seat availability for a specific schedule - powers the visual seat map. */

    @Transactional(readOnly = true)
    public List<SeatMapEntry> getSeatMap(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));

        List<Seat> seats = seatRepository.findByBusIdOrderByRowNumberAscColumnNumberAsc(schedule.getBus().getId());

        java.util.Set<Long> occupiedSeatIds = bookingRepository.findByScheduleId(scheduleId).stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || b.getStatus() == Booking.BookingStatus.PENDING)
                .map(b -> b.getSeat().getId())
                .collect(java.util.stream.Collectors.toSet());

        return seats.stream()
                .map(s -> new SeatMapEntry(s.getId(), s.getSeatNumber(), s.getSeatType(), occupiedSeatIds.contains(s.getId()),
                        s.getRowNumber(), s.getColumnNumber()))
                .collect(Collectors.toList());
    }

    private ScheduleSearchResult toSearchResult(Schedule s) {
        int totalSeats = seatRepository.findByBusIdOrderByRowNumberAscColumnNumberAsc(s.getBus().getId()).size();
        int bookedSeats = (int) bookingRepository.findByScheduleId(s.getId()).stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || b.getStatus() == Booking.BookingStatus.PENDING)
                .count();

        List<StopDto> stopDtos = stopRepository.findByRouteIdOrderBySequenceOrderAsc(s.getRoute().getId()).stream()
                .map(st -> new StopDto(st.getId(), st.getName(), st.getSequenceOrder(),
                        st.getLatitude(), st.getLongitude(), st.isPickupAllowed(), st.isDropAllowed()))
                .collect(Collectors.toList());

        List<com.busreservation.entity.Review> reviews = reviewRepository.findByBooking_Schedule_Route_Id(s.getRoute().getId());
        double avgRating = reviews.isEmpty() ? 0 : reviews.stream().mapToInt(com.busreservation.entity.Review::getRating).average().orElse(0);

        return new ScheduleSearchResult(
                s.getId(),
                s.getBus().getPlateNumber(),
                s.getBus().getBusType(),
                s.getRoute().getName(),
                s.getRoute().getId(),
                s.getDepartureTime(),
                s.getArrivalTime(),
                Math.max(0, totalSeats - bookedSeats),
                Math.round(avgRating * 10.0) / 10.0,
                reviews.size(),
                stopDtos,
                s.getStatus().name(),
                s.getBus().getDriverName(),
                s.getBus().getDriverPhone(),
                s.getBus().getLicenseNumber(),
                s.getBus().getBusPhotoUrl(),
                s.getBus().getId()
        );
    }
}
