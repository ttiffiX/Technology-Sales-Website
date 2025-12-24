package com.example.sale_tech_web.feature.payment.repository;

import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);

    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.expiresAt < :now")
    List<Payment> findExpiredPendingPayments(@Param("status") PaymentStatus status, @Param("now") LocalDateTime now);
}

