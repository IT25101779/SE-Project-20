package com.busreservation.pattern.security;

import com.busreservation.dto.LoginRequest;
import com.busreservation.entity.User;
import org.springframework.stereotype.Component;

/**
 * Concrete Handler 2 in Authentication Chain
 * -------------------------------------------
 * Ensures the user has not been deactivated or suspended by an Administrator.
 */
@Component
public class AccountActivationHandler extends AuthenticationHandler {

    @Override
    protected void doHandle(User user, LoginRequest request) {
        if (!user.isActive()) {
            throw new IllegalStateException(
                    "This account has been deactivated. Please contact an administrator to reactivate it."
            );
        }
    }
}
