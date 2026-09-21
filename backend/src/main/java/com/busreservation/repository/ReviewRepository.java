package com.busreservation.repository;

import com.busreservation.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBooking_Schedule_Route_Id(Long routeId);
    Optional<Review> findByBookingId(Long bookingId);
    boolean existsByBookingId(Long bookingId);
}
