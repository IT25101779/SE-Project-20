package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Core Function: Payment Processing (owner: Abeysinghe W.A.M.V.R)
 * Records the outcome of the sandbox/mock payment gateway (see
 * pattern.payment.PaymentStrategy for the Strategy-pattern implementation).
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking; // the "primary" (first) seat in the group this payment covers

    /** Mirrors booking.groupRef - lets PaymentRepository find a group's payment directly. */
    private String groupRef;

    @Column(nullable = false)
    private BigDecimal amount; // total for every seat in the group, not just `booking`'s seat

    @Column(nullable = false)
    private String method; // CARD, WALLET (mock)

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(unique = true)
    private String transactionRef;

    @Builder.Default
    private boolean flaggedDuplicate = false;

    private String refundReason;
    private LocalDateTime refundedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        PENDING, SUCCESSFUL, FAILED, REFUNDED
    }
}
