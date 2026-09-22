package com.busreservation.dto;

public record ReviewDto(
        Long id,
        String passengerName,
        int rating,
        String comment
) {}
