package com.busreservation.repository;

import com.busreservation.entity.WaitingList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaitingListRepository extends JpaRepository<WaitingList, Long> {
    List<WaitingList> findByScheduleIdOrderByRequestedAtAsc(Long scheduleId);
    boolean existsByScheduleIdAndPassengerId(Long scheduleId, Long passengerId);
}
