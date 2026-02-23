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

    public void sendVerificationEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác thực tài khoản - Technology Sales");
            message.setText(buildOtpEmailContent(otp));
            mailSender.send(message);
            log.info("OTP verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    public void sendPasswordResetEmail(String toEmail, String newPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Đặt lại mật khẩu - Technology Sales");
            message.setText(buildPasswordResetEmailContent(newPassword));
            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    private String buildOtpEmailContent(String otp) {
        return String.format("""
                Welcome to Technology Sales!
                
                Thank you for registering with us. Please verify your email address with the OTP below:
                
                ==============================
                        %s
                ==============================
                
                This OTP will expire in %s minutes.
                
                If you did not create this account, please ignore this email.
                
                Best regards,
                Technology Sales Team
                """, otp, AccountCleanupConfig.EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES);
    }

    private String buildPasswordResetEmailContent(String newPassword) {
        return String.format("""
                Password Reset - Technology Sales
                
                Your password has been reset successfully.
                
                Your new temporary password is: %s
                
                Please login with this password and change it immediately for security purposes.
                
                If you did not request this password reset, please contact us immediately.
                
                Best regards,
                Technology Sales Team
                """, newPassword);
    }
}
