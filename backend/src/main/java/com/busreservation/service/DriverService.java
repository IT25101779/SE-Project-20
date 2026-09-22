package com.busreservation.service;

import com.busreservation.dto.DriverScheduleDto;
import com.busreservation.dto.ManifestEntryDto;
import com.busreservation.entity.Booking;
import com.busreservation.entity.Schedule;
import com.busreservation.repository.BookingRepository;
import com.busreservation.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Driver / Conductor (secondary role, per project Section 4): a read-only
 * view of today's trips and passenger manifest.
 *
 * DEMO SIMPLIFICATION: the data model does not assign a specific driver to
 * a schedule (no "driver" field on Schedule), so this shows every
 * SCHEDULED/IN_TRIP/DELAYED trip departing today to any logged-in driver,
 * rather than filtering to "trips assigned to me". Adding a real
 * driver-to-schedule assignment would be the natural next step (a
 * `driver_id` column on Schedule, set by Admin when publishing a route).
 */
@Service
@RequiredArgsConstructor
public class DriverService {

    private final ScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<DriverScheduleDto> getTodaysSchedules() {
        LocalDateTime dayStart = LocalDate.now().atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);

        return scheduleRepository.findAll().stream()
                .filter(s -> s.getStatus() != Schedule.ScheduleStatus.CANCELLED)
                .filter(s -> !s.getDepartureTime().isBefore(dayStart) && s.getDepartureTime().isBefore(dayEnd)
                        || s.getStatus() == Schedule.ScheduleStatus.IN_TRIP)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ManifestEntryDto> getManifest(Long scheduleId) {
        return bookingRepository.findByScheduleId(scheduleId).stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .map(b -> new ManifestEntryDto(
                        b.getPassenger().getName(),
                        b.getSeat().getSeatNumber(),
                        b.getPickupStop().getName(),
                        b.getDropStop().getName(),
                        b.getStatus().name()))
                .collect(Collectors.toList());
    }

    private DriverScheduleDto toDto(Schedule s) {
        long passengerCount = bookingRepository.findByScheduleId(s.getId()).stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .count();
        return new DriverScheduleDto(
                s.getId(), s.getBus().getPlateNumber(), s.getRoute().getName(),
                s.getDepartureTime(), s.getArrivalTime(), s.getStatus().name(), (int) passengerCount);
    }
}
