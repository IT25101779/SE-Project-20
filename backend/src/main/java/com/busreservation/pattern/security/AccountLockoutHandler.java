package com.busreservation.pattern.security;

import com.busreservation.dto.LoginRequest;
import com.busreservation.entity.User;
import org.springframework.stereotype.Component;

/**
 * Concrete Handler 1 in Authentication Chain
 * -------------------------------------------
 * Verifies whether the account is currently undergoing a temporary lockout
 * following repeated failed authentication attempts (PBI-23).
 */
@Component
public class AccountLockoutHandler extends AuthenticationHandler {

    @Override
    protected void doHandle(User user, LoginRequest request) {
        if (user.isCurrentlyLocked()) {
            throw new IllegalStateException(
                    "This account is locked due to repeated failed login attempts. Try again after " +
                    user.getLockedUntil() + "."
            );
        }
    }
}
