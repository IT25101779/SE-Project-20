package com.busreservation.repository;

import com.busreservation.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);
    List<Notification> findByBookingId(Long bookingId);
    List<Notification> findAllByOrderBySentAtDesc();
}

