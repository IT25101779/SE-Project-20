package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Core Function: Real-Time Bus Tracking (owner: Weerasekara W.M.A.G.B.)
 * A single simulated GPS position update for a bus that is currently on an
 * active trip (see TrackingService's scheduled job).
 */
@Entity
@Table(name = "gps_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GpsLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    private double latitude;
    private double longitude;

    /** Index of the last stop passed along the route - used to estimate ETA. */
    private int lastStopIndex;

    private Double speedKmH;

    @Builder.Default
    private boolean archived = false;

    @Column(updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}
