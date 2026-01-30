package com.example.sale_tech_web.feature.email.scheduler;

import com.example.sale_tech_web.feature.email.config.AccountCleanupConfig;
import com.example.sale_tech_web.feature.email.repository.EmailVerificationTokenRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import static com.example.sale_tech_web.utils.Color.*;

/**
 * Scheduled job để tự động xóa các tài khoản chưa được xác thực sau 24 giờ
 * Chạy mỗi 6 giờ (có thể cấu hình qua AccountCleanupConfig.ACCOUNT_CLEANUP_CRON)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AccountScheduler {
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final UserRepository userRepository;

    @Scheduled(cron = AccountCleanupConfig.ACCOUNT_CLEANUP_CRON)
    @Transactional
    public void cleanupExpiredUnverifiedAccounts() {
        System.out.println(RED + "----------------------------------------------------------------" + RESET);
        System.out.println("Starting scheduled job: Cleanup Expired Unverified Accounts");

        try {
            // Tính thời điểm cutoff: 24 giờ trước
            LocalDateTime cutoffTime = LocalDateTime.now()
                    .minusHours(AccountCleanupConfig.UNVERIFIED_ACCOUNT_MAX_AGE_HOURS);

            // Tìm tất cả users chưa active và đã tạo quá 24h
            List<Users> expiredUsers = userRepository.findInactiveUsersOlderThan(cutoffTime);

            if (expiredUsers.isEmpty()) {
                System.out.println("No expired unverified accounts found");
                System.out.println(RED + "----------------------------------------------------------------" + RESET);
                return;
            }

            System.out.println("Found " + expiredUsers.size() + " expired unverified accounts to delete (created before + " + cutoffTime);

            int deletedCount = 0;

            for (Users user : expiredUsers) {
                try {
                    String username = user.getUsername();
                    String email = user.getEmail();
                    LocalDateTime createdAt = user.getCreatedAt();

                    // Xóa token verification nếu có
                    emailVerificationTokenRepository.deleteByUserId(user.getId());

                    // Xóa user (cascade sẽ xóa cart và các entity liên quan)
                    userRepository.delete(user);

                    deletedCount++;
                    System.out.println("Deleted expired unverified account: username=" + username + ", email=" + email + ", createdAt=" + createdAt + ", age=" + Duration.between(createdAt, LocalDateTime.now()).toHours() + "h");
                } catch (Exception e) {
                    log.error("Error deleting expired user: userId={}", user.getId(), e);
                }
            }

            System.out.println("Scheduled job completed: " + deletedCount + " accounts deleted");
            System.out.println(RED + "----------------------------------------------------------------" + RESET);
        } catch (Exception e) {
            log.error("Error in Cleanup Expired Unverified Accounts scheduled job", e);
            System.out.println(RED + "----------------------------------------------------------------" + RESET);
        }
    }
}

