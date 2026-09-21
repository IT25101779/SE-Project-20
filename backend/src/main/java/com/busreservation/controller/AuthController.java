package com.busreservation.controller;

import com.busreservation.dto.AuthResponse;
import com.busreservation.dto.CreateStaffRequest;
import com.busreservation.dto.LoginRequest;
import com.busreservation.dto.RegisterRequest;
import com.busreservation.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Core Function: User & Admin Management (owner: Kaweesha K.S.) */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** PBI-21: Admin creates a staff account with an approved role. */
    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public AuthResponse createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return authService.createStaffAccount(request);
    }
}
