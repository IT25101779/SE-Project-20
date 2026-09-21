package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Core Function: Search & Route/Schedule Management (owner: Sakalasooriya S.M.Y.V.B.)
 */
@Entity
@Table(name = "routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "Colombo - Kandy"

    @Column(nullable = false)
    private String originCity;

    @Column(nullable = false)
    private String destinationCity;

    private double distanceKm;

    private int estimatedDurationMinutes;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<Stop> stops = new ArrayList<>();
}
