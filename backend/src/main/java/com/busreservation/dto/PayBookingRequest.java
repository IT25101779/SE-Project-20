package com.busreservation.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Pays for an entire booking group (see CreateBookingRequest) in one shot.
 * Only the fields relevant to the chosen paymentMethod need to be filled in
 * - CardPaymentStrategy/WalletPaymentStrategy each validate their own
 * subset (see PaymentStrategy). This is deliberately real format validation
 * (Luhn check, expiry, CVV shape / wallet phone+PIN shape), not a random
 * coin-flip - see project System Limitations for what's still sandboxed
 * (no actual bank/wallet is contacted).
 */
public record PayBookingRequest(
        @NotBlank String groupRef,
        @NotBlank String paymentMethod, // "CARD" or "WALLET"

        // CARD fields
        String cardNumber,
        String cardHolderName,
        String expiryMonth,
        String expiryYear,
        String cvv,

        // WALLET fields
        String walletPhone,
        String walletPin
) {}
