package com.busreservation.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ScheduleSearchResult(
        Long scheduleId,
        String busPlateNumber,
        String busType,
        String routeName,
        Long routeId,
        LocalDateTime departureTime,
        LocalDateTime arrivalTime,
        int availableSeats,
        double averageRating,
        int reviewCount,
        List<StopDto> stops,
        String scheduleStatus,
        // Driver / bus detail fields
        String driverName,
        String driverPhone,
        String licenseNumber,
        String busPhotoUrl,
        Long busId
) {}
