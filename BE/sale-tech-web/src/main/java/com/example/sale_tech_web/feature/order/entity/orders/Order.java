package com.example.sale_tech_web.feature.order.entity.orders;

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
        name = "orders"
)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @JsonIgnore
    @Column(name = "customer_id")
    private Long customerId;

    @JsonIgnore
    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @JsonIgnore
    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;

    @Column(name = "status")
    private String status;

    @JsonIgnore
    @Column(name = "name")
    private String name;

    @JsonIgnore
    @Column(name = "phone", nullable = false)
    private String phone;

    @JsonIgnore
    @Column(name = "address", nullable = false)
    private String address;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.updateAt = LocalDateTime.now();  // Set thời gian mỗi khi insert hoặc update
    }
}
