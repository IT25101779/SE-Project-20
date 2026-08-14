package com.busreservation.config;

/**
 * DESIGN PATTERN: SINGLETON
 * ---------------------------------------------------------------------------
 * SystemConfig holds cross-cutting, read-mostly application settings (booking
 * rules, simulation parameters, etc.) that many services need to consult.
 *
 * Rather than injecting a Spring bean everywhere (which would also work,
 * since Spring beans are singletons by default), this class implements the
 * classic Gang-of-Four Singleton pattern explicitly with a private
 * constructor and a static accessor, so it can be demonstrated directly in
 * the project viva as a deliberately-applied design pattern rather than a
 * framework default.
 *
 * Thread-safety: the eager static field below is initialized once by the
 * JVM class-loader, which guarantees a single, thread-safe instance without
 * needing synchronized blocks.
 */
public final class SystemConfig {

    private static final SystemConfig INSTANCE = new SystemConfig();

    // ---- Booking rules ----
    private final int seatHoldMinutes = 10;          // how long a seat is held during checkout
    private final int maxFailedLogins = 5;           // account lockout threshold
    private final int lockoutMinutes = 15;

    // ---- Simulation parameters (see project System Limitations) ----
    private final int gpsTickSeconds = 5;             // how often simulated GPS position updates
    private final int paymentGatewayDelayMs = 800;    // artificial delay for the sandbox payment gateway

    private SystemConfig() {
        // private constructor prevents external instantiation
    }

    public static SystemConfig getInstance() {
        return INSTANCE;
    }

    public int getSeatHoldMinutes() {
        return seatHoldMinutes;
    }

    public int getMaxFailedLogins() {
        return maxFailedLogins;
    }

    public int getLockoutMinutes() {
        return lockoutMinutes;
    }

    public int getGpsTickSeconds() {
        return gpsTickSeconds;
    }

    public int getPaymentGatewayDelayMs() {
        return paymentGatewayDelayMs;
    }
}
