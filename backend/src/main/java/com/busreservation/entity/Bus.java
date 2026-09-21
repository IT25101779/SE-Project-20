package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Core Function: Search & Route/Schedule Management (owner: Sakalasooriya S.M.Y.V.B.)
 */
@Entity
@Table(name = "buses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String plateNumber;

    @Column(nullable = false)
    private String busType; // e.g. "Luxury", "Semi-Luxury", "Normal"

    @Column(nullable = false)
    private int seatCapacity;

    @Builder.Default
    private boolean unavailable = false; // true if pulled from service due to an incident

    private String unavailabilityReason;

    // Driver information
    private String driverName;
    private String driverPhone;
    private String licenseNumber;
    private String busPhotoUrl;
}
