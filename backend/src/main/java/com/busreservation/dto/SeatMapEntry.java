package com.busreservation.dto;

public record SeatMapEntry(
        Long seatId,
        String seatNumber,
        String seatType,
        boolean occupied,
        int rowNumber,
        int columnNumber
) {}
