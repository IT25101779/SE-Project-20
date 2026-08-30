package com.busreservation.pattern.payment;

import com.busreservation.dto.PayBookingRequest;

import java.math.BigDecimal;

/**
 * DESIGN PATTERN: STRATEGY
 * ---------------------------------------------------------------------------
 * Each payment method (card, wallet, ...) implements this interface with its
 * own validation/processing logic. PaymentService picks the right strategy
 * at runtime based on the method the passenger selected at checkout, without
 * any if/else chain of payment-method-specific code living in the service.
 *
 * Outcomes are DETERMINISTIC, based on real validation of the fields the
 * passenger entered (Luhn check + expiry + CVV for cards, phone/PIN shape
 * for wallet) - not a random chance. What's still sandboxed is that no real
 * bank or wallet provider is actually contacted; see System Limitations.
 */
public interface PaymentStrategy {

    /** @return the validation/processing outcome for the entered payment details. */
    PaymentResult process(BigDecimal amount, String payerReference, PayBookingRequest request);

    String getMethodName();

    record PaymentResult(boolean success, String transactionRef, String failureReason) {}
}
