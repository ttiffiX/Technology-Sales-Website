package com.example.sale_tech_web.feature.payment.entity;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.config.PaymentConfig;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Duration;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(name = "invoice")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "provider", length = 20)
    @Enumerated(EnumType.STRING)
    private PaymentMethod provider;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * Raw response từ payment gateway (JSON string)
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response", columnDefinition = "jsonb")
    private String rawResponse;

    public boolean isExpired() {
        if (this.status != PaymentStatus.PENDING) {
            return false;
        }

        if (this.expiresAt == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public long getRemainingSeconds() {
        if (this.status != PaymentStatus.PENDING) {
            return 0;
        }

        if (this.expiresAt == null) {
            return -1;
        }

        long seconds = Duration.between(LocalDateTime.now(), this.expiresAt).getSeconds();
        return Math.max(0, seconds);
    }

    public static LocalDateTime calculateExpiresAt(LocalDateTime createdAt) {
        return createdAt.plusMinutes(PaymentConfig.PAYMENT_TIMEOUT_MINUTES);
    }
}

