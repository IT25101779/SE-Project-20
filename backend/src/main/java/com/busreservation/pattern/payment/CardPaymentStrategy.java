package com.busreservation.pattern.payment;

import com.busreservation.config.SystemConfig;
import com.busreservation.dto.PayBookingRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.UUID;

/**
 * Sandbox card-payment strategy. The outcome is deterministic and based on
 * real validation of what the passenger typed in - not a random chance:
 *  - card number: digits only, 13-19 long, passes the Luhn checksum
 *    (the same algorithm real card networks use to catch typos/garbage -
 *    e.g. 4111 1111 1111 1111 is a standard Luhn-valid test number)
 *  - expiry: a real MM/YY that hasn't already passed
 *  - CVV: 3-4 digits
 * A short artificial delay simulates a gateway round-trip for the loading
 * spinner - see project System Limitations: no real card network is
 * actually contacted.
 */
@Component
public class CardPaymentStrategy implements PaymentStrategy {

    @Override
    public PaymentResult process(BigDecimal amount, String payerReference, PayBookingRequest request) {
        simulateGatewayDelay();

        String txnRef = "CARD-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String failure = validate(request);
        if (failure != null) {
            return new PaymentResult(false, txnRef, failure);
        }
        return new PaymentResult(true, txnRef, null);
    }

    private String validate(PayBookingRequest request) {
        if (isBlank(request.cardHolderName())) {
            return "Enter the name on the card.";
        }

        String digitsOnly = request.cardNumber() == null ? "" : request.cardNumber().replaceAll("[\\s-]", "");
        if (!digitsOnly.matches("\\d{13,19}")) {
            return "Card number must be 13-19 digits.";
        }
        if (!passesLuhnCheck(digitsOnly)) {
            return "Card number failed validation. Double-check the digits.";
        }

        if (request.cvv() == null || !request.cvv().matches("\\d{3,4}")) {
            return "CVV must be 3-4 digits.";
        }

        YearMonth expiry = parseExpiry(request.expiryMonth(), request.expiryYear());
        if (expiry == null) {
            return "Enter a valid expiry month and year.";
        }
        if (expiry.isBefore(YearMonth.now())) {
            return "This card has expired.";
        }

        return null; // all checks passed
    }

    /**
     * Luhn (mod-10) checksum: double every second digit from the right,
     * subtract 9 if the result is over 9, sum everything, valid if the
     * total is divisible by 10. Catches transposed/garbage digits the
     * same way real card issuers do.
     */
    private boolean passesLuhnCheck(String digits) {
        int sum = 0;
        boolean doubleDigit = false;
        for (int i = digits.length() - 1; i >= 0; i--) {
            int d = digits.charAt(i) - '0';
            if (doubleDigit) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            doubleDigit = !doubleDigit;
        }
        return sum % 10 == 0;
    }

    private YearMonth parseExpiry(String month, String year) {
        if (month == null || year == null) return null;
        try {
            int m = Integer.parseInt(month.trim());
            int y = Integer.parseInt(year.trim());
            if (y < 100) y += 2000; // accept 2-digit "YY"
            if (m < 1 || m > 12) return null;
            return YearMonth.of(y, m);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    @Override
    public String getMethodName() {
        return "CARD";
    }

    private void simulateGatewayDelay() {
        try {
            Thread.sleep(SystemConfig.getInstance().getPaymentGatewayDelayMs());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
