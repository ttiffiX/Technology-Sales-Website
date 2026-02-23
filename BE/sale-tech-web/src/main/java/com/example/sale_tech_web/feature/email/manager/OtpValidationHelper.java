package com.example.sale_tech_web.feature.email.manager;

import com.example.sale_tech_web.feature.email.config.AccountCleanupConfig;
import com.example.sale_tech_web.feature.email.entity.EmailVerificationToken;
import com.example.sale_tech_web.feature.email.repository.EmailVerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpValidationHelper {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Transactional(
            propagation = Propagation.REQUIRES_NEW,
            noRollbackFor = ResponseStatusException.class
    )
    public void validateOtp(Long tokenId, String inputOtp) {
        // Re-fetch trong persistence context mới
        EmailVerificationToken tokenEntity = emailVerificationTokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "OTP not found. Please request a new one."));

        // Hết hạn
        if (LocalDateTime.now().isAfter(tokenEntity.getExpiryDate())) {
            emailVerificationTokenRepository.delete(tokenEntity);
            throw new ResponseStatusException(HttpStatus.GONE,
                    "OTP has expired. Please request a new one.");
        }

        // Đã vượt quá số lần tối đa
        if (tokenEntity.getAttemptCount() >= AccountCleanupConfig.MAX_OTP_ATTEMPTS) {
            emailVerificationTokenRepository.delete(tokenEntity);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many failed attempts. Please request a new OTP.");
        }

        // Sai OTP
        if (!tokenEntity.getToken().equals(inputOtp.trim())) {
            int newCount = tokenEntity.getAttemptCount() + 1;
            tokenEntity.setAttemptCount(newCount);
            int remaining = AccountCleanupConfig.MAX_OTP_ATTEMPTS - newCount;

            if (remaining <= 0) {
                emailVerificationTokenRepository.delete(tokenEntity);
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many failed attempts. Please request a new OTP.");
            }

            emailVerificationTokenRepository.save(tokenEntity);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Invalid OTP. " + remaining + " attempt(s) remaining.");
        }
    }
}


