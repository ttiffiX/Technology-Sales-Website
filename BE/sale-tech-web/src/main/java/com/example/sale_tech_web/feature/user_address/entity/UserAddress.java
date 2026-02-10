package com.example.sale_tech_web.feature.user_address.entity;

import com.example.sale_tech_web.feature.users.entity.Users;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(
        name = "user_address"
)
public class UserAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "user_id", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Users user;

    private String provinceCode;
    private String wardCode;
    private String address;
    private boolean isDefault;
    private String label;
}
