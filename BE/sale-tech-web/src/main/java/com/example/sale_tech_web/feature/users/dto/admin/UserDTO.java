package com.example.sale_tech_web.feature.users.dto.admin;

import com.example.sale_tech_web.feature.users.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private Role role;
    private Boolean isBanned;
    private Boolean isActive;
    private LocalDateTime createdAt;

}
