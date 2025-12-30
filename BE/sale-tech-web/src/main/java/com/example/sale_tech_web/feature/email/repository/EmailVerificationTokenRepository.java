package com.example.sale_tech_web.feature.email.repository;

import com.example.sale_tech_web.feature.email.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
    void deleteByUserId(Long userId);
}

