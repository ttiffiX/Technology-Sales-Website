package com.example.sale_tech_web.feature.email.config;

public class AccountCleanupConfig {

    /**
     * Thời gian hết hạn của OTP xác thực email (10 phút)
     */
    public static final int EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES = 10;

    /**
     * Thời gian tồn tại tối đa của tài khoản chưa xác thực (24 giờ)
     */
    public static final int UNVERIFIED_ACCOUNT_MAX_AGE_HOURS = 24;

    /**
     * Thời gian chờ giữa các lần gửi lại OTP (60 giây)
     */
    public static final int RESEND_VERIFICATION_COOLDOWN_SECONDS = 60;

    /**
     * Scheduled job interval cho việc xóa tài khoản chưa xác thực hết hạn (cron format)
     * Chạy mỗi 6 giờ một lần
     */
    public static final String ACCOUNT_CLEANUP_CRON = "0 0 */6  * * *";

    private AccountCleanupConfig() {}
}
