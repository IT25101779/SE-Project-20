package com.busreservation.dto;

public record ManifestEntryDto(
        String passengerName,
        String seatNumber,
        String pickupStopName,
        String dropStopName,
        String status
) {}
