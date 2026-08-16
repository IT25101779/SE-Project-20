package com.busreservation.pattern.security;

import com.busreservation.dto.LoginRequest;
import com.busreservation.entity.User;

/**
 * ============================================================================
 * GOF DESIGN PATTERN: CHAIN OF RESPONSIBILITY (Behavioral Pattern)
 * ============================================================================
 * Owner: Kaweesha K.S. (Product Owner - User & Admin Management, Security & RBAC)
 * 
 * Intent:
 * Decouples the sender of an authentication request from its receivers by giving
 * more than one security handler a chance to inspect and validate the user.
 * Handlers are chained together sequentially; each handler performs its specific
 * security rule (lockout status, account activation, credential verification)
 * and passes the request along to the next handler in the pipeline.
 * ============================================================================
 */
public abstract class AuthenticationHandler {

    protected AuthenticationHandler nextHandler;

    /**
     * Links the next handler in the chain.
     * Fluent interface allowing chaining: handlerA.setNext(handlerB).setNext(handlerC).
     */
    public AuthenticationHandler setNext(AuthenticationHandler nextHandler) {
        this.nextHandler = nextHandler;
        return nextHandler;
    }

    /**
     * Executes this handler's security check and passes along to the next link.
     */
    public void handle(User user, LoginRequest request) {
        doHandle(user, request);
        if (nextHandler != null) {
            nextHandler.handle(user, request);
        }
    }

    /**
     * Template primitive step implemented by each concrete handler.
     */
    protected abstract void doHandle(User user, LoginRequest request);
}
