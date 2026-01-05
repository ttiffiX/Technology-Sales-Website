package com.example.sale_tech_web.feature.payment.service;

import com.example.sale_tech_web.feature.cart.repository.CartDetailRepository;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessingService {

    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void processSuccessfulPayment(Long orderId, Long receivedAmount, String transactionId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found: " + orderId));

        // Verify amount
        long expectedAmount = order.getTotalPrice() * 100L;
        if (expectedAmount != receivedAmount) {
            throw new ResponseStatusException(CONFLICT, "Payment amount mismatch for order " + orderId +
                    ": expected " + expectedAmount + ", received " + receivedAmount);
        }

        // Find existing Payment (created in placeOrder)
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Payment not found for order: " + orderId));

        // Check if already processed
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(CONFLICT, "Payment for order " + orderId + " already processed as PAID");
        }

        // Update Payment to SUCCESS
        payment.setStatus(PaymentStatus.PAID);
        payment.setTransactionId(transactionId);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Order stays PENDING - waiting for PM approval
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Order {} has unexpected status: {}", orderId, order.getStatus());
            throw new ResponseStatusException(CONFLICT, "Order has unexpected status: " + order.getStatus());
        }

        // Clear cart
        cartDetailRepository.deleteByUserId(order.getUser().getId());

        log.info("VNPay payment SUCCESS for order {}, Payment updated, Order remains PENDING for PM approval", orderId);
    }

    @Transactional
    public void processFailedPayment(Long orderId, String transactionId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found: " + orderId));

        // Find existing Payment (created in placeOrder)
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Payment not found for order: " + orderId));

        // Restore inventory for each product (since payment failed)
        List<Product> productsToUpdate = new ArrayList<>();
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            Product product = orderDetail.getProduct();
            product.setQuantity(product.getQuantity() + orderDetail.getQuantity());
            product.setQuantitySold(product.getQuantitySold() - orderDetail.getQuantity());
            productsToUpdate.add(product);
        }
        productRepository.saveAll(productsToUpdate);


        // Check if already processed
        if (payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(CONFLICT, "Payment for order " + orderId + " already processed with status: " + payment.getStatus());
        }

        // Update Payment to FAILED
        payment.setStatus(PaymentStatus.FAILED);
        payment.setTransactionId(transactionId);
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

