package com.busreservation.service;

import com.busreservation.dto.LoginRequest;
import com.busreservation.entity.Role;
import com.busreservation.entity.User;
import com.busreservation.repository.UserRepository;
import com.busreservation.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests the account-lockout security control (PBI-23): an account should
 * lock after SystemConfig.getMaxFailedLogins() consecutive bad-password
 * attempts, and reject login attempts while locked - even with the correct
 * password.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test Passenger")
                .email("test@demo.com")
                .passwordHash("hashed-password")
                .role(Role.PASSENGER)
                .failedLoginAttempts(0)
                .active(true)
                .build();
    }

    @Test
    void wrongPassword_incrementsFailedAttempts_andRejectsLogin() {
        when(userRepository.findByEmail("test@demo.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        LoginRequest request = new LoginRequest("test@demo.com", "wrong-password");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");

        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(1);
        verify(userRepository).save(testUser);
    }

    @Test
    void fifthConsecutiveFailure_locksTheAccount() {
        testUser.setFailedLoginAttempts(4); // one more failure should trip the lock (max = 5)
        when(userRepository.findByEmail("test@demo.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        LoginRequest request = new LoginRequest("test@demo.com", "wrong-password");

        assertThatThrownBy(() -> authService.login(request)).isInstanceOf(IllegalArgumentException.class);

        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(testUser.isCurrentlyLocked()).isTrue();
    }

    @Test
    void lockedAccount_rejectsLogin_evenWithCorrectPassword() {
        testUser.setLockedUntil(java.time.LocalDateTime.now().plusMinutes(10));
        when(userRepository.findByEmail("test@demo.com")).thenReturn(Optional.of(testUser));

        LoginRequest request = new LoginRequest("test@demo.com", "correct-password");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("locked");

        // password should never even be checked while locked
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void correctPassword_resetsFailedAttemptCounter() {
        testUser.setFailedLoginAttempts(3);
        when(userRepository.findByEmail("test@demo.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("fake-jwt-token");

        LoginRequest request = new LoginRequest("test@demo.com", "correct-password");
        authService.login(request);

        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(0);
        assertThat(testUser.getLockedUntil()).isNull();
    }
}
