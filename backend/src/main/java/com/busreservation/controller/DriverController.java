package com.busreservation.controller;

import com.busreservation.dto.DriverScheduleDto;
import com.busreservation.dto.ManifestEntryDto;
import com.busreservation.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Driver / Conductor (secondary role) - read-only today's trips + passenger manifest. */
@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/schedules")
    public List<DriverScheduleDto> todaysSchedules() {
        return driverService.getTodaysSchedules();
    }

    @GetMapping("/schedules/{id}/manifest")
    public List<ManifestEntryDto> manifest(@PathVariable Long id) {
        return driverService.getManifest(id);
    }
}
