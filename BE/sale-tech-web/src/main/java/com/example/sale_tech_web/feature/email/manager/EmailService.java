package com.example.sale_tech_web.feature.email.manager;

import com.example.sale_tech_web.feature.email.config.AccountCleanupConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    // Gửi OTP xác thực tài khoản
    public void sendVerificationEmail(String toEmail, String otp) {
        sendOtpEmail(
                toEmail,
                "Email Verification - Technology Sales",
                "verify your email address",
                otp,
                AccountCleanupConfig.EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES
        );
        log.info("OTP verification email sent to: {}", toEmail);
    }

    // Gửi OTP đặt lại mật khẩu
    public void sendPasswordResetEmail(String toEmail, String otp) {
        sendOtpEmail(
                toEmail,
                "Password Reset - Technology Sales",
                "reset your password",
                otp,
                AccountCleanupConfig.EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES
        );
        log.info("OTP password reset email sent to: {}", toEmail);
    }

    // ── Hàm dùng chung: gửi email chứa OTP ───────────────────
    private void sendOtpEmail(String toEmail, String subject, String purpose, String otp, int expiryMinutes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(buildOtpEmailContent(purpose, otp, expiryMinutes));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email");
        }
    }

    // ── Template chung cho mọi loại OTP ───────────────────────
    private String buildOtpEmailContent(String purpose, String otp, int expiryMinutes) {
        return String.format("""
                Hello,

                You requested to %s on Technology Sales.

                Your OTP code is:

                ==============================
                            %s
                ==============================

                This code will expire in %d minutes.
                Do NOT share this code with anyone.

                If you did not make this request, please ignore this email.

                Best regards,
                Technology Sales Team
                """, purpose, otp, expiryMinutes);
    }
}
