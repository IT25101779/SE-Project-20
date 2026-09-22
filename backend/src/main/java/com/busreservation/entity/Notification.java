package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Core Function: Notification & Alert Management (owner: Wijewardana D.S.)
 * Created via NotificationFactory (Factory Method pattern) and delivered
 * (mock send) through one of the Channel values below.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long bookingId; // nullable - not every notification is booking-related

    @Column(nullable = false)
    private String type; // BOOKING_CONFIRMED, PAYMENT_RESULT, DELAY, CANCELLATION, SCHEDULE_CHANGE...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Channel channel;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    @Column(updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    void prePersist() {
        this.sentAt = LocalDateTime.now();
    }

    public enum Channel { SMS, EMAIL, IN_APP }
    public enum DeliveryStatus { PENDING, SENT, FAILED }
}
