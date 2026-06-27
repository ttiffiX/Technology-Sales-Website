package com.example.sale_tech_web.feature.payment.vnpay_manager;

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
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessingService {

    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;

    @Transactional
    public String processSuccessfulPayment(String transactionId, Long receivedAmount, String transactionNo, String payDate) {
        Payment payment = paymentRepository.findByTransactionId(transactionId).orElse(null);

        if (payment == null) {
            return "01"; // Order not found
        }

        // Verify amount
        long expectedAmount = payment.getAmount() * 100L;
        if (expectedAmount != receivedAmount) {
            log.warn("Payment amount mismatch for txnRef {}: expected {}, received {}", transactionId, expectedAmount, receivedAmount);
            return "04"; // Invalid amount
        }

        // Check if already processed
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return "02"; // Order already confirmed
        }

        // Update Payment to SUCCESS
        payment.setStatus(PaymentStatus.PAID);
        payment.setVnpTransactionNo(transactionNo);
        payment.setVnpPayDate(payDate);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Clear cart
        Order order = payment.getOrder();
        List<Long> purchasedProductIds = order.getOrderDetails().stream()
                .map(orderDetail -> orderDetail.getProduct().getId())
                .toList();

        cartDetailRepository.deleteByUserIdAndProductIds(order.getUser().getId(), purchasedProductIds);

        log.info("VNPay payment SUCCESS for order {}, Payment updated", order.getId());
        return "00"; // Confirm Success
    }

    @Transactional
    public String processFailedPayment(String transactionId, String transactionNo, String payDate) {
        Payment payment = paymentRepository.findByTransactionId(transactionId).orElse(null);

        if (payment == null) {
            return "01"; // Order not found
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return "02"; // Order already confirmed
        }

        Order order = payment.getOrder();

        // Restore inventory atomically for each product (since payment failed)
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            productRepository.incrementStockOnRevert(orderDetail.getProduct().getId(), orderDetail.getQuantity());
        }

        // Update Payment to FAILED
        payment.setStatus(PaymentStatus.FAILED);
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
        log.info("Order {} cancelled due to VNPay payment failure", order.getId());
        return "00"; // Confirm Success
    }
}

