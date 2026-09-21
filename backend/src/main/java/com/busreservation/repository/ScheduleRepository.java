package com.busreservation.repository;

import com.busreservation.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @Query("SELECT s FROM Schedule s WHERE s.bus.id = :busId " +
           "AND s.status <> com.busreservation.entity.Schedule.ScheduleStatus.CANCELLED " +
           "AND s.departureTime < :end AND s.arrivalTime > :start")
    List<Schedule> findOverlappingForBus(@Param("busId") Long busId,
                                          @Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Schedule s WHERE LOWER(s.route.originCity) = LOWER(:origin) " +
           "AND LOWER(s.route.destinationCity) = LOWER(:destination) " +
           "AND s.departureTime >= :dayStart AND s.departureTime < :dayEnd " +
           "AND s.status <> com.busreservation.entity.Schedule.ScheduleStatus.CANCELLED")
    List<Schedule> search(@Param("origin") String origin,
                           @Param("destination") String destination,
                           @Param("dayStart") LocalDateTime dayStart,
                           @Param("dayEnd") LocalDateTime dayEnd);

    List<Schedule> findByStatus(Schedule.ScheduleStatus status);
}
