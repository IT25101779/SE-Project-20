package com.busreservation.dto;

public record MaintenanceReportRequest(
    Long busId,
    String reason,
    String breakdownLocation,
    Double latitude,
    Double longitude
) {}
