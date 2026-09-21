package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Core Function: Online Booking with Pickup/Drop Point Selection (owner: Viveka M.C.)
 *
 * Reliability NFR: a seat is HELD (status=PENDING) with holdExpiresAt set
 * while the passenger is paying, and is only CONFIRMED once payment
 * succeeds. See BookingService for the seat-hold / auto-release logic and
 * PaymentObserver for how a successful payment flips this to CONFIRMED.
 */
@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_stop_id", nullable = false)
    private Stop pickupStop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_stop_id", nullable = false)
    private Stop dropStop;

    @Column(nullable = false)
    private LocalDate travelDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    /** While PENDING, the seat is held until this instant (Reliability NFR). */
    private LocalDateTime holdExpiresAt;

    /** Ticket reference shown to the passenger and encoded into the QR code. */
    @Column(unique = true)
    private String ticketReference;

    /**
     * Shared UUID across every seat booked together in one checkout. A
     * family of 4 booking 4 seats at once still gets 4 separate Booking
     * rows - one per seat, so each seat keeps its own QR ticket - but they
     * share this groupRef so payment happens once for the whole group
     * instead of once per seat. Null on legacy single-seat rows created
     * before this field existed.
     */
    private String groupRef;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, WAITLISTED, EXPIRED
    }
}
