package com.busreservation.controller;

import com.busreservation.dto.CreateScheduleRequest;
import com.busreservation.dto.DelayScheduleRequest;
import com.busreservation.dto.ScheduleSearchResult;
import com.busreservation.entity.Schedule;
import com.busreservation.entity.User;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.AdminService;
import com.busreservation.service.ScheduleService;
import com.busreservation.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/** Core Function: Search & Route/Schedule Management (owner: Sakalasooriya S.M.Y.V.B.) */
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final TrackingService trackingService;
    private final AdminService adminService;
    private final CurrentUserProvider currentUserProvider;

    /** PBI-01: public search - no login required to browse available trips. */
    @GetMapping("/search")
    public List<ScheduleSearchResult> search(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        return scheduleService.search(origin, destination, date);
    }

    /** Seat availability for a schedule - powers the visual seat map (public, same as search). */
    @GetMapping("/{id}/seats")
    public List<com.busreservation.dto.SeatMapEntry> seatMap(@PathVariable Long id) {
        return scheduleService.getSeatMap(id);
    }

    /** PBI-09 / PBI-10: publish a schedule (admin only), with conflict detection. */
    @PostMapping("/manage")
    @PreAuthorize("hasRole('ADMIN')")
    public Schedule publish(@Valid @RequestBody CreateScheduleRequest request) {
        return scheduleService.publishSchedule(request);
    }

    /** PBI-11: record a revised departure time and delay reason (audited - operational change). */
    @PatchMapping("/manage/{id}/delay")
    @PreAuthorize("hasRole('ADMIN')")
    public Schedule recordDelay(@PathVariable Long id, @Valid @RequestBody DelayScheduleRequest request) {
        Schedule updated = scheduleService.recordDelay(id, request);
        trackingService.broadcastDelay(updated);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "SCHEDULE_DELAYED", "Schedule", id, request.reason());
        return updated;
    }

    /** PBI-12: nominate a replacement bus for a cancelled/affected schedule (audited). */
    @PatchMapping("/manage/{id}/replacement-bus/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Schedule assignReplacementBus(@PathVariable Long id, @PathVariable Long busId) {
        Schedule updated = scheduleService.assignReplacementBus(id, busId);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "REPLACEMENT_BUS_ASSIGNED", "Schedule", id,
                "New bus id: " + busId);
        return updated;
    }

    /** View all schedules (Admin & Support Staff) */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_STAFF')")
    public List<ScheduleSearchResult> all() {
        return scheduleService.getAllSchedules();
    }

    /** Update schedule entry (Admin) */
    @PutMapping("/manage/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Schedule updateSchedule(@PathVariable Long id, @Valid @RequestBody CreateScheduleRequest request) {
        Schedule updated = scheduleService.updateSchedule(id, request);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "SCHEDULE_UPDATED", "Schedule", id, "Schedule updated");
        return updated;
    }

    /** Delete / cancel a schedule entry (Admin) */
    @DeleteMapping("/manage/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "SCHEDULE_DELETED", "Schedule", id, "Schedule removed");
    }
}




