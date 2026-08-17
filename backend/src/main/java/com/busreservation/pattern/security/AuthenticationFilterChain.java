package com.busreservation.pattern.security;

import com.busreservation.dto.LoginRequest;
import com.busreservation.entity.User;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Chain Assembler / Runner
 * ------------------------
 * Assembles the Authentication Handlers in strict sequential order:
 *   1. AccountLockoutHandler       (checks temporary lock timer)
 *   2. AccountActivationHandler    (checks admin active status)
 *   3. CredentialsValidationHandler (checks BCrypt password & updates failed counter)
 */
@Component
@RequiredArgsConstructor
public class AuthenticationFilterChain {

    private final AccountLockoutHandler lockoutHandler;
    private final AccountActivationHandler activationHandler;
    private final CredentialsValidationHandler credentialsHandler;

    private AuthenticationHandler chainHead;

    @PostConstruct
    public void buildChain() {
        // Fluent chain linkage
        lockoutHandler.setNext(activationHandler)
                      .setNext(credentialsHandler);
        this.chainHead = lockoutHandler;
    }

    /**
     * Executes the authentication pipeline against the user and request.
     */
    public void execute(User user, LoginRequest request) {
        if (chainHead != null) {
            chainHead.handle(user, request);
        }
    }
}
