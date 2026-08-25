package com.busreservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Minor function: admin activity/audit log for accountability on sensitive actions. */
@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long staffId;
    private String staffName;

    @Column(nullable = false)
    private String action; // e.g. "SCHEDULE_UPDATED", "REFUND_APPROVED"

    @Column(nullable = false)
    private String entityName; // e.g. "Schedule", "Payment"

    private Long entityId;

    @Column(length = 1000)
    private String details;

    @Column(updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}
