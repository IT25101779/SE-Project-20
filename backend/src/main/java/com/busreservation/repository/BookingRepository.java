package com.busreservation.repository;

import com.busreservation.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByPassengerIdOrderByCreatedAtDesc(Long passengerId);

    List<Booking> findByScheduleId(Long scheduleId);

    List<Booking> findByPassengerIdAndScheduleId(Long passengerId, Long scheduleId);

    List<Booking> findByGroupRefOrderBySeatIdAsc(String groupRef);

    Optional<Booking> findByTicketReference(String ticketReference);

    @Query("SELECT b FROM Booking b WHERE b.seat.id = :seatId AND b.schedule.id = :scheduleId " +
           "AND b.status IN (com.busreservation.entity.Booking.BookingStatus.PENDING, " +
           "com.busreservation.entity.Booking.BookingStatus.CONFIRMED)")
    List<Booking> findActiveForSeatAndSchedule(@Param("seatId") Long seatId, @Param("scheduleId") Long scheduleId);

    @Query("SELECT b FROM Booking b WHERE b.status = com.busreservation.entity.Booking.BookingStatus.PENDING " +
           "AND b.holdExpiresAt < :now")
    List<Booking> findExpiredHolds(@Param("now") LocalDateTime now);
}
