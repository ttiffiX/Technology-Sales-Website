package com.example.sale_tech_web.feature.email.manager;

import com.example.sale_tech_web.exception.GoneException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.exception.TooManyRequestsException;
import com.example.sale_tech_web.exception.UnprocessableEntityException;
import com.example.sale_tech_web.feature.email.config.AccountCleanupConfig;
import com.example.sale_tech_web.feature.email.entity.EmailVerificationToken;
import com.example.sale_tech_web.feature.email.repository.EmailVerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpValidationHelper {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Transactional(
            propagation = Propagation.REQUIRES_NEW,
            noRollbackFor = RuntimeException.class
    )
    public void validateOtp(Long tokenId, String inputOtp) {
        // Re-fetch trong persistence context mới
        EmailVerificationToken tokenEntity = emailVerificationTokenRepository.findById(tokenId)
                .orElseThrow(() -> new NotFoundException(
                        "OTP not found. Please request a new one."));

        // Hết hạn
        if (LocalDateTime.now().isAfter(tokenEntity.getExpiryDate())) {
            emailVerificationTokenRepository.delete(tokenEntity);
            throw new GoneException(
                    "OTP has expired. Please request a new one.");
        }

        // Đã vượt quá số lần tối đa
        if (tokenEntity.getAttemptCount() >= AccountCleanupConfig.MAX_OTP_ATTEMPTS) {
            emailVerificationTokenRepository.delete(tokenEntity);
            throw new TooManyRequestsException(
                    "Too many failed attempts. Please request a new OTP.");
        }

        // Sai OTP
        if (!tokenEntity.getToken().equals(inputOtp.trim())) {
            int newCount = tokenEntity.getAttemptCount() + 1;
            tokenEntity.setAttemptCount(newCount);
            int remaining = AccountCleanupConfig.MAX_OTP_ATTEMPTS - newCount;

            if (remaining <= 0) {
                emailVerificationTokenRepository.delete(tokenEntity);
                throw new TooManyRequestsException(
                        "Too many failed attempts. Please request a new OTP.");
            }

            emailVerificationTokenRepository.save(tokenEntity);
            throw new UnprocessableEntityException(
                    "Invalid OTP. " + remaining + " attempt(s) remaining.");
        }
    }
}
