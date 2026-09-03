package com.busreservation.service;

import com.busreservation.dto.AdminStatsDto;
import com.busreservation.entity.Booking;
import com.busreservation.entity.Bus;
import com.busreservation.entity.Payment;
import com.busreservation.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Backs the Admin Overview/analytics tab. Simple in-memory aggregation - fine at this demo's data scale. */
@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminStatsDto getStats() {
        List<Booking> bookings = bookingRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<Bus> buses = busRepository.findAll();

        long confirmedBookings = bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count();

        BigDecimal totalRevenue = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESSFUL)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeBuses = buses.stream().filter(b -> !b.isUnavailable()).count();
        long unavailableBuses = buses.stream().filter(Bus::isUnavailable).count();

        long totalPassengers = userRepository.findByRole(com.busreservation.entity.Role.PASSENGER).size();

        Map<String, Long> bookingsByStatus = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getStatus().name(), LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> paymentsByStatus = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getStatus().name(), LinkedHashMap::new, Collectors.counting()));

        Map<String, BigDecimal> revenueByRoute = new LinkedHashMap<>();
        for (Payment p : payments) {
            if (p.getStatus() != Payment.PaymentStatus.SUCCESSFUL) continue;
            String routeName = p.getBooking().getSchedule().getRoute().getName();
            revenueByRoute.merge(routeName, p.getAmount(), BigDecimal::add);
        }

        return new AdminStatsDto(
                bookings.size(),
                confirmedBookings,
                totalRevenue,
                activeBuses,
                unavailableBuses,
                routeRepository.findAll().size(),
                totalPassengers,
                bookingsByStatus,
                paymentsByStatus,
                revenueByRoute
        );
    }
}
