package com.busreservation.service;

import com.busreservation.config.SystemConfig;
import com.busreservation.dto.AuthResponse;
import com.busreservation.dto.CreateStaffRequest;
import com.busreservation.dto.LoginRequest;
import com.busreservation.dto.RegisterRequest;
import com.busreservation.entity.Role;
import com.busreservation.entity.User;
import com.busreservation.repository.UserRepository;
import com.busreservation.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Core Function: User & Admin Management (owner: Kaweesha K.S.)
 * Handles passenger self-registration, login for all roles, and the
 * account-lockout security control (Non-Functional Requirement: Security).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.PASSENGER)
                .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    /** PBI-21: System Administrator creates a staff account with an approved role. */
    @Transactional
    public AuthResponse createStaffAccount(CreateStaffRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        if (request.role() == Role.PASSENGER) {
            throw new IllegalArgumentException("Use passenger registration for passenger accounts.");
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (user.isCurrentlyLocked()) {
            throw new IllegalStateException("This account is locked due to repeated failed login attempts. " +
                    "Try again after " + user.getLockedUntil() + ".");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            registerFailedLogin(user);
            throw new IllegalArgumentException("Invalid email or password.");
        }

        // successful login resets the failed-attempt counter
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    /** PBI-23: lock an account after several unsuccessful login attempts. */
    private void registerFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        SystemConfig config = SystemConfig.getInstance();
        if (attempts >= config.getMaxFailedLogins()) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(config.getLockoutMinutes()));
        }
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
