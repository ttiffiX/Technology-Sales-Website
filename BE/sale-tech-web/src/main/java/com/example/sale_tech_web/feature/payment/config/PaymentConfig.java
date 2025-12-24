package com.example.sale_tech_web.feature.payment.config;

public class PaymentConfig {

    /**
     * Payment timeout duration in minutes
     * Used for both VNPay expiration and system-level timeout checking
     */
    public static final int PAYMENT_TIMEOUT_MINUTES = 1;

    /**
     * Scheduled job interval for checking expired payments (in cron format)
     * Current: Every 5 minutes
     */
    public static final String PAYMENT_CLEANUP_CRON = "0 */5 * * * *";

    private PaymentConfig() {
        // Prevent instantiation
    }
}

