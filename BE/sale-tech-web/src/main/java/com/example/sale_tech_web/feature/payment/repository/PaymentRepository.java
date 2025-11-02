package com.example.sale_tech_web.feature.payment.repository;

import com.example.sale_tech_web.feature.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
