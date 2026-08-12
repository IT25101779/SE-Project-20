package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Core Function: Online Booking (minor function: waiting list for full buses). */
@Entity
@Table(name = "waiting_list")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;

    @Column(updatable = false)
    private LocalDateTime requestedAt;

    @Builder.Default
    private boolean notified = false;

    @PrePersist
    void prePersist() {
        this.requestedAt = LocalDateTime.now();
    }
}
