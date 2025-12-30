package com.example.sale_tech_web.feature.users.entity;

import com.example.sale_tech_web.feature.users.enums.Role;
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
        name = "users"
)
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "role")
    private Role role;

    private String name;
    private boolean isActive = false;
    private LocalDateTime createdAt;
    private String imageUrl;

}
