package com.busreservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Web-Based Bus Ticket Reservation System
 * SE2030 - Software Engineering Group Project
 *
 * Entry point for the Spring Boot backend. @EnableScheduling powers the
 * simulated GPS tracking job in {@link com.busreservation.service.TrackingService}.
 */
@SpringBootApplication
@EnableScheduling
public class BusReservationApplication {
    public static void main(String[] args) {
        SpringApplication.run(BusReservationApplication.class, args);
    }
}
