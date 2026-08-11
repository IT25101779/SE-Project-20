package com.busreservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Core Function: Search & Route/Schedule Management (owner: Sakalasooriya S.M.Y.V.B.)
 * An intermediate stop along a route - this is what lets passengers pick a
 * boarding/alighting point that isn't just the route's two terminals
 * (Core Function: Online Booking with Pickup/Drop Point Selection).
 */
@Entity
@Table(name = "stops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    @JsonIgnore
    private Route route;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int sequenceOrder; // order of this stop along the route, 0-based

    private double latitude;
    private double longitude;

    @Builder.Default
    private boolean pickupAllowed = true;

    @Builder.Default
    private boolean dropAllowed = true;
}
