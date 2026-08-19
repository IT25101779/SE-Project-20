package com.busreservation.dto;

public record StopDto(
        Long id,
        String name,
        int sequenceOrder,
        double latitude,
        double longitude,
        boolean pickupAllowed,
        boolean dropAllowed
) {}
