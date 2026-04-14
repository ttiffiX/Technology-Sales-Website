package com.example.sale_tech_web.feature.users.manager.admin;

import com.example.sale_tech_web.feature.users.dto.admin.AdminPasswordRequest;
import com.example.sale_tech_web.feature.users.dto.admin.AdminRegisterRequest;
import com.example.sale_tech_web.feature.users.dto.admin.UserDTO;
import com.example.sale_tech_web.feature.users.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminServiceInterface {
    Page<UserDTO> getAllUsers(String keyword, Role role, Pageable pageable);

    List<Role> getAllRole();

    UserDTO addUser(AdminRegisterRequest request);

    UserDTO updateUserRole(Long id, Role role);

    String deleteUser(Long id, AdminPasswordRequest adminPassword);

    UserDTO updateBanStatus(Long id, Boolean status);
}
