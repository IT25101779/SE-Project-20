package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Core Function: Online Booking with Pickup/Drop Point Selection (owner: Viveka M.C.)
 * A physical seat position on a bus (shared seat map layout across all of
 * that bus's schedules).
 */
@Entity
@Table(name = "seats", uniqueConstraints = @UniqueConstraint(columnNames = {"bus_id", "seatNumber"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private String seatNumber; // display label, e.g. "12A"

    @Builder.Default
    private String seatType = "STANDARD"; // STANDARD, WINDOW, etc.

    /**
     * Physical position on the bus, used to render the visual seat map as an
     * actual bus layout (rows with a center aisle) rather than a flat list.
     * 1-indexed. Layout convention: 4 seats per row (2 + aisle + 2), so
     * columnNumber 1-2 sit left of the aisle and 3-4 sit right of it.
     */
    // columnDefinition default guards teammates on the persistent MySQL
    // profile: if `seats` already has rows from a prior run, Hibernate's
    // ddl-auto=update ALTER TABLE ADD COLUMN would otherwise fail under
    // MySQL's strict mode (NOT NULL column with no default on a non-empty
    // table). data.sql deletes and re-seeds every row right after startup
    // anyway, so the default is only ever a landing pad, never the real value.
    @Column(nullable = false, columnDefinition = "int default 0")
    private int rowNumber;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int columnNumber;
}
