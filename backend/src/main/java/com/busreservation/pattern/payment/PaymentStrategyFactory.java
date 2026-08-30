package com.busreservation.pattern.payment;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Resolves the correct {@link PaymentStrategy} bean for a given method name
 * ("CARD", "WALLET", ...). Spring injects every PaymentStrategy
 * implementation on the classpath automatically - adding a new payment
 * method is a matter of adding one new @Component class, no switch
 * statements to update.
 */
@Component
public class PaymentStrategyFactory {

    private final Map<String, PaymentStrategy> strategies;

    public PaymentStrategyFactory(List<PaymentStrategy> allStrategies) {
        this.strategies = allStrategies.stream()
                .collect(Collectors.toMap(PaymentStrategy::getMethodName, s -> s));
    }

    public PaymentStrategy resolve(String methodName) {
        PaymentStrategy strategy = strategies.get(methodName.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported payment method: " + methodName);
        }
        return strategy;
    }
}
