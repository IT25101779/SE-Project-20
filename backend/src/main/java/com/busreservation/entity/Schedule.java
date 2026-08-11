package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Core Function: Search & Route/Schedule Management (owner: Sakalasooriya S.M.Y.V.B.)
 * A single published trip: one bus, on one route, at a specific departure time.
 */
@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ScheduleStatus status = ScheduleStatus.SCHEDULED;

    /** Set when the schedule is delayed - PBI-11 "revised departure time and reason". */
    private LocalDateTime revisedDepartureTime;
    private String delayReason;

    public enum ScheduleStatus {
        SCHEDULED, IN_TRIP, DELAYED, CANCELLED, COMPLETED
    }
}
