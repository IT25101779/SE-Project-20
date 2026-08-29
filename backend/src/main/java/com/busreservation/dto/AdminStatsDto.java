package com.busreservation.dto;

import java.math.BigDecimal;
import java.util.Map;

public record AdminStatsDto(
        long totalBookings,
        long confirmedBookings,
        BigDecimal totalRevenue,
        long activeBuses,
        long unavailableBuses,
        long totalRoutes,
        long totalPassengers,
        Map<String, Long> bookingsByStatus,
        Map<String, Long> paymentsByStatus,
        Map<String, BigDecimal> revenueByRoute
) {}
