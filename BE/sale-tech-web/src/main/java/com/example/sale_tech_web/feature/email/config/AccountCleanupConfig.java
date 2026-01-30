package com.example.sale_tech_web.feature.email.config;

public class AccountCleanupConfig {

    /**
     * Thời gian hết hạn của token xác thực email (30 phút)
     * Sau khi token hết hạn, user vẫn có thể request resend token
     */
    public static final int EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES = 30;

    /**
     * Thời gian tồn tại tối đa của tài khoản chưa xác thực (24 giờ)
     * Sau 24h không xác thực, tài khoản sẽ bị xóa tự động
     */
    public static final int UNVERIFIED_ACCOUNT_MAX_AGE_HOURS = 24;

    /**
     * Scheduled job interval cho việc xóa tài khoản chưa xác thực hết hạn (cron format)
     * Chạy mỗi 6 giờ một lần
     */
    public static final String ACCOUNT_CLEANUP_CRON = "0 0 */6  * * *";

    private AccountCleanupConfig() {
        // Prevent instantiation
    }
}
