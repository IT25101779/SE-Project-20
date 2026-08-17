package com.busreservation.pattern.security;

import com.busreservation.config.SystemConfig;
import com.busreservation.dto.LoginRequest;
import com.busreservation.entity.User;
import com.busreservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Concrete Handler 3 in Authentication Chain
 * -------------------------------------------
 * Validates BCrypt hash against the supplied credentials.
 * If validation fails, it enforces brute-force protection using Kaweesha's
 * Singleton Pattern (SystemConfig) to track failed login counts and trigger lockouts.
 */
@Component
@RequiredArgsConstructor
public class CredentialsValidationHandler extends AuthenticationHandler {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Override
    protected void doHandle(User user, LoginRequest request) {
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            // Brute force protection: increment attempts
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            // SINGLETON PATTERN: reads system-wide threshold from SystemConfig
            SystemConfig config = SystemConfig.getInstance();
            if (attempts >= config.getMaxFailedLogins()) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(config.getLockoutMinutes()));
            }
            userRepository.save(user);

            throw new IllegalArgumentException("Invalid email or password.");
        }
    }
}
