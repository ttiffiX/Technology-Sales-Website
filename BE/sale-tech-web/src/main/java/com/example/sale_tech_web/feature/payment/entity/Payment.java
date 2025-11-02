package com.example.sale_tech_web.feature.payment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(
        name = "payment"
)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long payment_id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "status", nullable = false)
    private String status;

    @JsonIgnore
    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.updateAt = LocalDateTime.now();
    }
}
