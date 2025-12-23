package com.example.sale_tech_web.feature.payment.service;

import com.example.sale_tech_web.feature.cart.repository.CartDetailRepository;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessingService {

    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;

    /**
     * Process successful payment
     * - Verify order exists and amount matches
     * - Update order status
     * - Delete cart items
     */
    @Transactional
    public void processSuccessfulPayment(Long orderId, Long receivedAmount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        // Verify amount
        long expectedAmount = order.getTotalPrice() * 100L;
        if (expectedAmount != receivedAmount) {
            log.error("Amount mismatch - Expected: {}, Received: {}", expectedAmount, receivedAmount);
            throw new IllegalArgumentException("Amount mismatch");
        }

        // Only process if PENDING (avoid duplicate)
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Order {} already processed with status: {}", orderId, order.getStatus());
            return;
        }

        // Update order
        order.setStatus(OrderStatus.APPROVED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Delete cart
        cartDetailRepository.deleteByUserId(order.getUser().getId());

        log.info("Order {} updated to APPROVED and cart cleared", orderId);
    }

    /**
     * Process failed payment
     */
    @Transactional
    public void processFailedPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CANCELLED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            log.info("Order {} updated to CANCELLED due to payment failure", orderId);
        }
    }

    /**
     * Extract order ID from VNPay orderInfo string
     * Format: "Thanh toan don hang #123"
     */
    public Long extractOrderId(String orderInfo) {
        try {
            if (orderInfo == null || !orderInfo.contains("#")) {
                return null;
            }
            String[] parts = orderInfo.split("#");
            if (parts.length < 2) {
                return null;
            }
            return Long.parseLong(parts[1].trim());
        } catch (Exception e) {
            log.error("Error extracting orderId from orderInfo: {}", orderInfo, e);
            return null;
        }
    }
}

