package com.example.sale_tech_web.feature.users.manager.admin;

import com.example.sale_tech_web.feature.users.dto.admin.AdminPasswordRequest;
import com.example.sale_tech_web.feature.users.dto.admin.AdminRegisterRequest;
import com.example.sale_tech_web.feature.users.dto.admin.UserDTO;
import com.example.sale_tech_web.feature.users.enums.Role;

import java.util.List;

public interface AdminServiceInterface {
    List<UserDTO> getAllUsers();

    List<Role> getAllRole();

    UserDTO addUser(AdminRegisterRequest request);

    UserDTO updateUserRole(Long id, Role role);

    String deleteUser(Long id, AdminPasswordRequest adminPassword);

    UserDTO updateBanStatus(Long id, Boolean status);
}
