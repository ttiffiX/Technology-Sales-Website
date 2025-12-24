package com.example.sale_tech_web.feature.payment.scheduler;

import com.example.sale_tech_web.feature.payment.config.PaymentConfig;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import com.example.sale_tech_web.feature.payment.service.PaymentProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job to automatically cancel expired PENDING payments
 * Runs every 5 minutes (configurable via PaymentConfig.PAYMENT_CLEANUP_CRON)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentTimeoutScheduler {

    private final PaymentRepository paymentRepository;
    private final PaymentProcessingService paymentProcessingService;

    /**
     * Automatically cancel expired PENDING payments
     * Scheduled to run based on PaymentConfig.PAYMENT_CLEANUP_CRON
     */
    @Scheduled(cron = PaymentConfig.PAYMENT_CLEANUP_CRON)
    @Transactional
    public void cancelExpiredPayments() {
        log.info("----------------------------------------------------------------");
        log.info("Starting scheduled job: cancelExpiredPayments");

        try {
            List<Payment> expiredPayments = paymentRepository.findExpiredPendingPayments(
                    PaymentStatus.PENDING,
                    LocalDateTime.now()
            );

            if (expiredPayments.isEmpty()) {
                log.info("No expired pending payments found");
                return;
            }

            log.info("Found {} expired pending payments to cancel", expiredPayments.size());

            int successCount = 0;
            int failCount = 0;

            for (Payment payment : expiredPayments) {
                try {
                    Long orderId = payment.getOrder().getId();
                    paymentProcessingService.processFailedPayment(orderId, null);
                    successCount++;
                    log.info("Auto-cancelled expired payment for order {}, expiresAt: {}",
                            orderId, payment.getExpiresAt());
                } catch (Exception e) {
                    failCount++;
                    log.error("Error cancelling payment for order {}",
                            payment.getOrder().getId(), e);
                }
            }

            log.info("Scheduled job completed: {} succeeded, {} failed", successCount, failCount);
            log.info("----------------------------------------------------------------");
        } catch (Exception e) {
            log.error("Error in cancelExpiredPayments scheduled job", e);
            log.info("----------------------------------------------------------------");
        }
    }
}

