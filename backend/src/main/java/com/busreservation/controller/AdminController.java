package com.busreservation.controller;

import com.busreservation.entity.*;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.AdminService;
import com.busreservation.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AdminStatsService adminStatsService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/stats")
    public com.busreservation.dto.AdminStatsDto stats() {
        return adminStatsService.getStats();
    }

    @PostMapping("/buses")
    public Bus createBus(@RequestBody Bus bus) {
        return adminService.createBus(bus);
    }

    @GetMapping("/buses")
    public List<Bus> buses() {
        return adminService.getAllBuses();
    }

    /** PBI-20: Fleet Operations Supervisor marks an incident-affected bus unavailable (audited).
     *  Exposed under /admin for simplicity in this demo; in production this would
     *  likely be its own FLEET_SUPERVISOR role. */
    @PatchMapping("/buses/{id}/unavailable")
    public Bus setUnavailable(@PathVariable Long id, @RequestParam String reason) {
        Bus bus = adminService.setBusUnavailable(id, reason);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "BUS_MARKED_UNAVAILABLE", "Bus", id, reason);
        return bus;
    }

    /** Re-enable a bus that was previously marked unavailable. */
    @PatchMapping("/buses/{id}/available")
    public Bus setAvailable(@PathVariable Long id) {
        Bus bus = adminService.setBusAvailable(id);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "BUS_MARKED_AVAILABLE", "Bus", id, "Bus re-enabled");
        return bus;
    }

    @DeleteMapping("/buses/{id}")
    public void deleteBus(@PathVariable Long id) {
        adminService.deleteBus(id);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "BUS_DELETED", "Bus", id, "Bus deleted");
    }

    @PostMapping("/routes")
    public Route createRoute(@RequestBody Route route) {
        return adminService.createRoute(route);
    }

    @GetMapping("/routes")
    public List<Route> routes() {
        return adminService.getAllRoutes();
    }

    @PutMapping("/routes/{id}")
    public Route updateRoute(@PathVariable Long id, @RequestBody Route route) {
        Route updated = adminService.updateRoute(id, route);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "ROUTE_UPDATED", "Route", id, "Route updated");
        return updated;
    }


    @DeleteMapping("/routes/{id}")
    public void deleteRoute(@PathVariable Long id) {
        adminService.deleteRoute(id);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "ROUTE_DELETED", "Route", id, "Route deleted");
    }

    @GetMapping("/routes/{routeId}/stops")
    public List<Stop> getStops(@PathVariable Long routeId) {
        return adminService.getStopsForRoute(routeId);
    }

    @PostMapping("/routes/{routeId}/stops")
    public Stop addStop(@PathVariable Long routeId, @RequestBody Stop stop) {
        Stop created = adminService.addStop(routeId, stop);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "STOP_ADDED", "Stop", created.getId(),
                "Added stop '" + stop.getName() + "' to route ID " + routeId);
        return created;
    }

    @PutMapping("/stops/{stopId}")
    public Stop updateStop(@PathVariable Long stopId, @RequestBody Stop stop) {
        Stop updated = adminService.updateStop(stopId, stop);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "STOP_UPDATED", "Stop", stopId,
                "Updated stop '" + updated.getName() + "'");
        return updated;
    }

    @DeleteMapping("/stops/{stopId}")
    public void deleteStop(@PathVariable Long stopId) {
        adminService.deleteStop(stopId);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "STOP_DELETED", "Stop", stopId,
                "Deleted stop ID " + stopId);
    }

    @GetMapping("/users")
    public List<User> allUsers() {
        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{id}/toggle-active")
    public User toggleUserActive(@PathVariable Long id) {
        User updated = adminService.toggleUserActive(id);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "USER_STATUS_TOGGLED", "User", id,
                "Active: " + updated.isActive());
        return updated;
    }

    @PatchMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        User updated = adminService.updateUserRole(id, role);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "USER_ROLE_UPDATED", "User", id,
                "New role: " + role);
        return updated;
    }

    /** PBI-24: user-access report for a selected role. */
    @GetMapping("/reports/users")
    public List<User> userAccessReport(@RequestParam Role role) {
        return adminService.userAccessReport(role);
    }

    /** PBI-22: inspect the audit log. */
    @GetMapping("/audit-log")
    public List<AuditLog> auditLog() {
        return adminService.getAuditLog();
    }
}


