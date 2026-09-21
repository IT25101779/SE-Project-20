package com.busreservation.repository;

import com.busreservation.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByOriginCityContainingIgnoreCaseAndDestinationCityContainingIgnoreCase(String origin, String destination);
}
