package com.busreservation.service;

import com.busreservation.entity.*;
import com.busreservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Core Function: User & Admin Management (owner: Kaweesha K.S.)
 * Also backs some cross-cutting admin operations (bus/route CRUD is owned by
 * the Search & Route/Schedule function, but the account/report/audit pieces
 * below belong to User & Admin Management).
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SeatRepository seatRepository;

    /**
     * Seat layout for a 54-seat bus:
     * - Rows 1-12: 4 seats each (columns 1=Left-A, 2=Left-B, 3=Right-C, 4=Right-D)
     * - Row 13 (last row): 6 seats (columns 1=A, 2=B, 3=C, 4=D, 5=E, 6=F)
     * Total: 12*4 + 6 = 54 seats
     */
    private static final int STANDARD_ROWS = 12;
    private static final int SEATS_PER_STANDARD_ROW = 4;
    private static final int LAST_ROW_SEATS = 6;

    // Column suffixes for standard rows (1-indexed columns 1-4)
    private static final String[] STANDARD_SUFFIXES = {"", "A", "B", "C", "D"};
    // Column suffixes for last row (1-indexed columns 1-6)
    private static final String[] LAST_ROW_SUFFIXES = {"", "A", "B", "C", "D", "E", "F"};

    @Transactional
    public Bus createBus(Bus bus) {
        Bus saved = busRepository.save(bus);
        generateSeatsForBus(saved);
        return saved;
    }

    /**
     * Creates the physical seat layout for a newly added bus:
     * - 12 standard rows x 4 seats (Left: A/B, Right: C/D)
     * - 1 last row x 6 seats (Left: A/B/C, Right: D/E/F)
     * = 54 seats total
     */
    private void generateSeatsForBus(Bus bus) {
        // Standard rows 1-12, 4 seats each
        for (int row = 1; row <= STANDARD_ROWS; row++) {
            for (int col = 1; col <= SEATS_PER_STANDARD_ROW; col++) {
                String seatNum = row + STANDARD_SUFFIXES[col];
                seatRepository.save(Seat.builder()
                        .bus(bus)
                        .seatNumber(seatNum)
                        .seatType("STANDARD")
                        .rowNumber(row)
                        .columnNumber(col)
                        .build());
            }
        }
        // Last row (row 13), 6 seats
        int lastRow = STANDARD_ROWS + 1;
        for (int col = 1; col <= LAST_ROW_SEATS; col++) {
            String seatNum = lastRow + LAST_ROW_SUFFIXES[col];
            seatRepository.save(Seat.builder()
                    .bus(bus)
                    .seatNumber(seatNum)
                    .seatType("STANDARD")
                    .rowNumber(lastRow)
                    .columnNumber(col)
                    .build());
        }
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    /** PBI-20 (Fleet Operations Supervisor): mark an incident-affected bus unavailable. */
    @Transactional
    public Bus setBusUnavailable(Long busId, String reason) {
        Bus bus = busRepository.findById(busId).orElseThrow(() -> new IllegalArgumentException("Bus not found"));
        bus.setUnavailable(true);
        bus.setUnavailabilityReason(reason);
        return busRepository.save(bus);
    }

    /** Re-enable a bus that was previously marked unavailable. */
    @Transactional
    public Bus setBusAvailable(Long busId) {
        Bus bus = busRepository.findById(busId).orElseThrow(() -> new IllegalArgumentException("Bus not found"));
        bus.setUnavailable(false);
        bus.setUnavailabilityReason(null);
        return busRepository.save(bus);
    }

    @Transactional
    public Route createRoute(Route route) {
        return routeRepository.save(route);
    }

    @Transactional
    public Route updateRoute(Long routeId, Route updated) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        route.setName(updated.getName());
        route.setOriginCity(updated.getOriginCity());
        route.setDestinationCity(updated.getDestinationCity());
        route.setDistanceKm(updated.getDistanceKm());
        route.setEstimatedDurationMinutes(updated.getEstimatedDurationMinutes());
        return routeRepository.save(route);
    }


    @Transactional
    public Stop addStop(Long routeId, Stop stop) {
        Route route = routeRepository.findById(routeId).orElseThrow(() -> new IllegalArgumentException("Route not found"));
        stop.setRoute(route);
        return stopRepository.save(stop);
    }

    public List<Stop> getStopsForRoute(Long routeId) {
        return stopRepository.findByRouteIdOrderBySequenceOrderAsc(routeId);
    }

    @Transactional
    public Stop updateStop(Long stopId, Stop updated) {
        Stop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Stop not found"));
        stop.setName(updated.getName());
        stop.setSequenceOrder(updated.getSequenceOrder());
        stop.setLatitude(updated.getLatitude());
        stop.setLongitude(updated.getLongitude());
        stop.setPickupAllowed(updated.isPickupAllowed());
        stop.setDropAllowed(updated.isDropAllowed());
        return stopRepository.save(stop);
    }

    @Transactional
    public void deleteStop(Long stopId) {
        stopRepository.deleteById(stopId);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    @Transactional
    public void deleteRoute(Long routeId) {
        routeRepository.deleteById(routeId);
    }

    @Transactional
    public void deleteBus(Long busId) {
        seatRepository.deleteByBusId(busId);
        busRepository.deleteById(busId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    /** PBI-24: generate a user-access report for a selected role. */
    public List<User> userAccessReport(Role role) {
        return userRepository.findByRole(role);
    }

    /** PBI-22: inspect the audit log for a selected record (simple filter-all for the demo). */
    public List<AuditLog> getAuditLog() {
        return auditLogRepository.findAll();
    }

    @Transactional
    public void logAction(Long staffId, String staffName, String action, String entityName, Long entityId, String details) {
        AuditLog log = AuditLog.builder()
                .staffId(staffId).staffName(staffName)
                .action(action).entityName(entityName).entityId(entityId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}

