package com.busreservation.dto;

public record FleetTrackingDto(
        Long scheduleId,
        String busPlateNumber,
        String busType,
        String driverName,
        String routeName,
        String status,
        double latitude,
        double longitude,
        Double speedKmH,
        String etaToArrival,
        double distanceRemainingKm,
        double progressPercent,
        long totalGpsLogs,
        boolean archived
) {}
