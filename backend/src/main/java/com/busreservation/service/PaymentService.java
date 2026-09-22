package com.busreservation.service;

import com.busreservation.dto.BookingGroupResponse;
import com.busreservation.dto.BookingResponse;
import com.busreservation.dto.PayBookingRequest;
import com.busreservation.dto.RefundDecisionRequest;
import com.busreservation.entity.Booking;
import com.busreservation.entity.Payment;
import com.busreservation.pattern.observer.BookingEvent;
import com.busreservation.pattern.observer.BookingEventPublisher;
import com.busreservation.pattern.payment.PaymentStrategy;
import com.busreservation.pattern.payment.PaymentStrategyFactory;
import com.busreservation.repository.BookingRepository;
import com.busreservation.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core Function: Payment Processing (owner: Abeysinghe W.A.M.V.R)
 *
 * SANDBOX ONLY - no real payment provider is contacted (see project System
 * Limitations). Demonstrates the STRATEGY pattern via PaymentStrategyFactory.
 * Pays for an entire booking group (all seats from one checkout) in a
 * single transaction - see CreateBookingRequest / BookingGroupResponse.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentStrategyFactory strategyFactory;
    private final QrCodeService qrCodeService;
    private final BookingEventPublisher eventPublisher;

    /** PBI-13: verify a payment transaction before tickets are confirmed - covers every seat in the group. */
    @Transactional
    public BookingGroupResponse processPayment(PayBookingRequest request) {
        List<Booking> bookings = bookingRepository.findByGroupRefOrderBySeatIdAsc(request.groupRef());
        if (bookings.isEmpty()) {
            throw new IllegalArgumentException("Booking not found");
        }

        for (Booking booking : bookings) {
            if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                throw new IllegalStateException("This booking is not awaiting payment (status: " + booking.getStatus() + ").");
            }
            if (booking.getHoldExpiresAt() != null && booking.getHoldExpiresAt().isBefore(LocalDateTime.now())) {
                for (Booking b : bookings) {
                    b.setStatus(Booking.BookingStatus.EXPIRED);
                    bookingRepository.save(b);
                }
                throw new IllegalStateException("The seat hold for this booking has expired. Please book again.");
            }
        }

        Booking primary = bookings.get(0);
        BigDecimal totalAmount = BookingService.FLAT_FARE_PER_SEAT.multiply(BigDecimal.valueOf(bookings.size()));

        // PBI-14: flag duplicate payment attempts for the same group
        boolean duplicateAttempt = paymentRepository.findByGroupRef(request.groupRef()).isPresent();

        // STRATEGY PATTERN: resolve CardPaymentStrategy / WalletPaymentStrategy at runtime
        PaymentStrategy strategy = strategyFactory.resolve(request.paymentMethod());
        PaymentStrategy.PaymentResult result = strategy.process(totalAmount, primary.getTicketReference(), request);

        Payment payment = Payment.builder()
                .booking(primary)
                .groupRef(request.groupRef())
                .amount(totalAmount)
                .method(strategy.getMethodName())
                .status(result.success() ? Payment.PaymentStatus.SUCCESSFUL : Payment.PaymentStatus.FAILED)
                .transactionRef(result.transactionRef())
                .flaggedDuplicate(duplicateAttempt)
                .build();
        paymentRepository.save(payment);

        List<BookingResponse> responses = new ArrayList<>();
        if (result.success()) {
            for (Booking booking : bookings) {
                booking.setStatus(Booking.BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
                String qrBase64 = qrCodeService.generateBase64Png(booking.getTicketReference(), 250);
                responses.add(toResponse(booking, qrBase64));
            }
            eventPublisher.publish(new BookingEvent(
                    BookingEvent.Type.PAYMENT_SUCCEEDED, primary.getId(), primary.getPassenger().getId(), null));
        } else {
            for (Booking booking : bookings) {
                responses.add(toResponse(booking, null));
            }
            eventPublisher.publish(new BookingEvent(
                    BookingEvent.Type.PAYMENT_FAILED, primary.getId(), primary.getPassenger().getId(),
                    result.failureReason()));
        }

        return new BookingGroupResponse(
                request.groupRef(), responses, totalAmount, primary.getHoldExpiresAt(),
                result.success() ? null : result.failureReason());
    }

    private BookingResponse toResponse(Booking booking, String qrCodeBase64) {
        return new BookingResponse(
                booking.getId(), booking.getStatus().name(), booking.getTicketReference(),
                booking.getSeat().getSeatNumber(), booking.getPickupStop().getName(), booking.getDropStop().getName(),
                booking.getTravelDate(), booking.getHoldExpiresAt(), qrCodeBase64
        );
    }

    /** PBI-15: record a decision on a refund request with a reason (Finance Officer). */
    @Transactional
    public Payment decideRefund(Long paymentId, RefundDecisionRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (request.approved()) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            payment.setRefundedAt(LocalDateTime.now());
        }
        payment.setRefundReason(request.reason());
        return paymentRepository.save(payment);
    }

    /** PBI-16: reconcile bookings against payment gateway transactions by transaction ID. */
    public Payment reconcileByTransactionRef(String transactionRef) {
        return paymentRepository.findByTransactionRef(transactionRef)
                .orElseThrow(() -> new IllegalArgumentException("No payment found for transaction reference " + transactionRef));
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Transactional
    public void voidPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        payment.setStatus(Payment.PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }
}

