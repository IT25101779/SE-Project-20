package com.busreservation.dto;

import java.time.LocalDateTime;
import java.util.List;

public record DriverScheduleDto(
        Long scheduleId,
        String busPlateNumber,
        String routeName,
        LocalDateTime departureTime,
        LocalDateTime arrivalTime,
        String status,
        int passengerCount
) {}

