package com.busreservation.repository;

import com.busreservation.entity.GpsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GpsLogRepository extends JpaRepository<GpsLog, Long> {
    Optional<GpsLog> findTopByScheduleIdOrderByTimestampDesc(Long scheduleId);

    List<GpsLog> findByScheduleIdOrderByTimestampAsc(Long scheduleId);

    long countByScheduleId(Long scheduleId);

    long countByScheduleIdAndArchivedTrue(Long scheduleId);

    @Modifying
    @Query("UPDATE GpsLog g SET g.archived = true WHERE g.schedule.id = :scheduleId")
    int archiveByScheduleId(@Param("scheduleId") Long scheduleId);

    @Modifying
    @Query("DELETE FROM GpsLog g WHERE g.schedule.id = :scheduleId AND g.archived = true")
    int purgeArchivedByScheduleId(@Param("scheduleId") Long scheduleId);

    @Modifying
    @Query("DELETE FROM GpsLog g WHERE g.schedule.id = :scheduleId")
    int deleteByScheduleId(@Param("scheduleId") Long scheduleId);
}
