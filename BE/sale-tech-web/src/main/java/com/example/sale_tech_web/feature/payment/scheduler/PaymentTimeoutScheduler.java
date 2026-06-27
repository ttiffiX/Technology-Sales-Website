package com.example.sale_tech_web.feature.payment.scheduler;

import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.payment.config.PaymentConfig;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static com.example.sale_tech_web.utils.Color.*;

/**
 * Scheduled job to automatically cancel expired PENDING payments and restore inventory
 * Runs every 5 minutes (configurable via PaymentConfig.PAYMENT_CLEANUP_CRON)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentTimeoutScheduler {

    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    /**
     * Automatically cancel expired PENDING payments and restore product inventory
     * Scheduled to run based on PaymentConfig.PAYMENT_CLEANUP_CRON
     */
    @Scheduled(cron = PaymentConfig.PAYMENT_CLEANUP_CRON)
    @Transactional
    public void cancelExpiredPayments() {
        System.out.println(RED + "----------------------------------------------------------------" + RESET);
        System.out.println("Starting scheduled job: Cancel Expired Payments (with inventory restoration)");

        try {
            List<Payment> expiredPayments = paymentRepository.findExpiredPendingPayments(
                    PaymentStatus.PENDING,
                    LocalDateTime.now()
            );

            if (expiredPayments.isEmpty()) {
                System.out.println("No expired pending payments found");
                System.out.println(RED + "----------------------------------------------------------------" + RESET);
                return;
            }

            System.out.println("Found " + expiredPayments.size() + " expired pending payments to cancel");

            int successCount = 0;
            int failCount = 0;

            for (Payment payment : expiredPayments) {
                try {
                    Order order = payment.getOrder();
                    for (OrderDetail orderDetail : order.getOrderDetails()) {
                        productRepository.incrementStockOnRevert(orderDetail.getProduct().getId(), orderDetail.getQuantity());
                    }

                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    if (order.getStatus() == OrderStatus.PENDING) {
                        order.setStatus(OrderStatus.CANCELLED);
                        order.setUpdatedAt(LocalDateTime.now());
                        orderRepository.save(order);
                    }

                    successCount++;
                    System.out.println("Auto-cancelled expired payment for order " + order.getId() + ", inventory restored, expiresAt: " + payment.getExpiresAt());
                } catch (Exception e) {
                    failCount++;
                    log.error("Error cancelling payment for order {}",
                            payment.getOrder().getId(), e);
                }
            }

            System.out.println("Scheduled job completed: " + successCount + " succeeded, " + failCount + " failed");
            System.out.println(RED + "----------------------------------------------------------------" + RESET);
        } catch (Exception e) {
            log.error("Error in Cancel Expired Payments scheduled job", e);
            System.out.println(RED + "----------------------------------------------------------------" + RESET);
        }
    }
}

