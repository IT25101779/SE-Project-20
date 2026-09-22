package com.busreservation.repository;

import com.busreservation.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    /**
     * Physical layout order (row, then column) - what the visual seat map
     * needs. Note this is NOT the same as sorting by seatNumber, which is a
     * display-label string and sorts "10" before "2".
     */
    List<Seat> findByBusIdOrderByRowNumberAscColumnNumberAsc(Long busId);
    void deleteByBusId(Long busId);
}

