package com.example.sale_tech_web.feature.payment.service;

import com.example.sale_tech_web.exception.ConflictException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.feature.cart.repository.CartDetailRepository;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessingService {

    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void processSuccessfulPayment(Long orderId, Long receivedAmount, String transactionId, String transactionNo, String payDate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // Verify amount
        long expectedAmount = order.getTotalPrice() * 100L;
        if (expectedAmount != receivedAmount) {
            throw new ConflictException("Payment amount mismatch for order " + orderId +
                    ": expected " + expectedAmount + ", received " + receivedAmount);
        }

        // Find existing Payment (created in placeOrder)
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Payment not found for order: " + orderId));

        if (payment.getTransactionId() != null && !payment.getTransactionId().equals(transactionId)) {
            throw new ConflictException("Payment transaction ID mismatch for order " + orderId);
        }

        // Check if already processed
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new ConflictException("Payment for order " + orderId + " already processed as PAID");
        }

        // Update Payment to SUCCESS
        payment.setStatus(PaymentStatus.PAID);
//        payment.setTransactionId(transactionId);
        payment.setVnpTransactionNo(transactionNo);
        payment.setVnpPayDate(payDate);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Order stays PENDING - waiting for PM approval
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Order {} has unexpected status: {}", orderId, order.getStatus());
            throw new ConflictException("Order has unexpected status: " + order.getStatus());
        }

        // Clear cart
        cartDetailRepository.deleteByUserId(order.getUser().getId());

        log.info("VNPay payment SUCCESS for order {}, Payment updated, Order remains PENDING for PM approval", orderId);
    }

    @Transactional
    public void processFailedPayment(Long orderId, String transactionId, String transactionNo, String payDate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // Find existing Payment (created in placeOrder)
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Payment not found for order: " + orderId));

        // Restore inventory atomically for each product (since payment failed)
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            productRepository.incrementStockOnRevert(orderDetail.getProduct().getId(), orderDetail.getQuantity());
        }

        if (payment.getTransactionId() != null && !payment.getTransactionId().equals(transactionId)) {
            throw new ConflictException("Payment transaction ID mismatch for order " + orderId);
        }

        // Check if already processed
        if (payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.PAID) {
            throw new ConflictException("Payment for order " + orderId + " already processed with status: " + payment.getStatus());
        }

        // Update Payment to FAILED
        payment.setStatus(PaymentStatus.FAILED);
//        payment.setTransactionId(transactionId);
        payment.setVnpTransactionNo(transactionNo);
        payment.setVnpPayDate(payDate);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Cancel order if still PENDING
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CANCELLED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }
        log.info("Order {} cancelled due to VNPay payment failure", orderId);
    }

    /**
     * Extract order ID from VNPay orderInfo string
     * Format: "Thanh toan don hang 123"
     */
    public Long extractOrderId(String orderInfo) {
        try {
            if (orderInfo == null || orderInfo.isEmpty()) {
                return null;
            }

            // Regex tìm dãy số nằm ở cuối chuỗi
            Pattern pattern = Pattern.compile("(\\d+)$");
            Matcher matcher = pattern.matcher(orderInfo.trim());

            if (matcher.find()) {
                return Long.parseLong(matcher.group(1));
            }

            return null;
        } catch (Exception e) {
            log.error("Error extracting orderId from orderInfo: {}", orderInfo, e);
            return null;
        }
    }
}

