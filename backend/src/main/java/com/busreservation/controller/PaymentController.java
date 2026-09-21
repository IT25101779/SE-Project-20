package com.busreservation.controller;

import com.busreservation.dto.BookingGroupResponse;
import com.busreservation.dto.PayBookingRequest;
import com.busreservation.dto.RefundDecisionRequest;
import com.busreservation.entity.Payment;
import com.busreservation.entity.User;
import com.busreservation.security.CurrentUserProvider;
import com.busreservation.service.AdminService;
import com.busreservation.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Core Function: Payment Processing (owner: Abeysinghe W.A.M.V.R) - SANDBOX ONLY. */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final AdminService adminService;
    private final CurrentUserProvider currentUserProvider;

    /** PBI-13 / PBI-14: verify payment before ticket issue, flags duplicate attempts automatically. */
    @PostMapping("/checkout")
    public BookingGroupResponse checkout(@Valid @RequestBody PayBookingRequest request) {
        return paymentService.processPayment(request);
    }

    /** PBI-15: Finance Officer records a refund decision with a reason (audited - financial change). */
    @PatchMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('FINANCE_OFFICER')")
    public Payment decideRefund(@PathVariable Long paymentId, @Valid @RequestBody RefundDecisionRequest request) {
        Payment result = paymentService.decideRefund(paymentId, request);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(),
                request.approved() ? "REFUND_APPROVED" : "REFUND_REJECTED", "Payment", paymentId, request.reason());
        return result;
    }

    /** PBI-16: Finance Officer reconciles a booking's payment by transaction ID. */
    @GetMapping("/reconcile/{transactionRef}")
    @PreAuthorize("hasRole('FINANCE_OFFICER')")
    public Payment reconcile(@PathVariable String transactionRef) {
        return paymentService.reconcileByTransactionRef(transactionRef);
    }

    @GetMapping
    @PreAuthorize("hasRole('FINANCE_OFFICER')")
    public List<Payment> all() {
        return paymentService.getAllPayments();
    }

    /** Proposal Payment Processing Delete: Finance Officer voids duplicate/incorrect payment record. */
    @DeleteMapping("/{paymentId}")
    @PreAuthorize("hasRole('FINANCE_OFFICER')")
    public void voidPayment(@PathVariable Long paymentId) {
        paymentService.voidPayment(paymentId);
        User staff = currentUserProvider.getCurrentUser();
        adminService.logAction(staff.getId(), staff.getName(), "PAYMENT_VOIDED", "Payment", paymentId, "Payment marked void/failed");
    }
}


