package com.busreservation.pattern.payment;

import com.busreservation.config.SystemConfig;
import com.busreservation.dto.PayBookingRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Sandbox digital-wallet payment strategy - see CardPaymentStrategy for the
 * pattern rationale. Deterministic, based on real format validation:
 *  - phone: a Sri Lankan mobile number, either 0XXXXXXXXX (10 digits) or
 *    +94XXXXXXXXX
 *  - PIN: exactly 4 digits
 * No real wallet provider is contacted - see System Limitations.
 */
@Component
public class WalletPaymentStrategy implements PaymentStrategy {

    private static final String SL_MOBILE_LOCAL = "0\\d{9}";
    private static final String SL_MOBILE_INTL = "\\+94\\d{9}";

    @Override
    public PaymentResult process(BigDecimal amount, String payerReference, PayBookingRequest request) {
        simulateGatewayDelay();

        String txnRef = "WALLET-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String failure = validate(request);
        if (failure != null) {
            return new PaymentResult(false, txnRef, failure);
        }
        return new PaymentResult(true, txnRef, null);
    }

    private String validate(PayBookingRequest request) {
        String phone = request.walletPhone() == null ? "" : request.walletPhone().replaceAll("[\\s-]", "");
        if (!phone.matches(SL_MOBILE_LOCAL) && !phone.matches(SL_MOBILE_INTL)) {
            return "Enter a valid mobile number (e.g. 07XXXXXXXX).";
        }
        if (request.walletPin() == null || !request.walletPin().matches("\\d{4}")) {
            return "Wallet PIN must be exactly 4 digits.";
        }
        return null;
    }

    @Override
    public String getMethodName() {
        return "WALLET";
    }

    private void simulateGatewayDelay() {
        try {
            Thread.sleep(SystemConfig.getInstance().getPaymentGatewayDelayMs() / 2L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
