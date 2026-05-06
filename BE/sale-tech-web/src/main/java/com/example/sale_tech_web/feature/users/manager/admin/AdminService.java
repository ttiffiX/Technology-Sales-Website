package com.example.sale_tech_web.feature.users.manager.admin;

import com.example.sale_tech_web.exception.BadRequestException;
import com.example.sale_tech_web.exception.ConflictException;
import com.example.sale_tech_web.exception.ForbiddenException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.exception.UnauthorizedException;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.users.dto.admin.AdminPasswordRequest;
import com.example.sale_tech_web.feature.users.dto.admin.AdminRegisterRequest;
import com.example.sale_tech_web.feature.users.dto.admin.UserDTO;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.enums.Role;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService implements AdminServiceInterface {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Page<UserDTO> getAllUsers(String keyword, Role role, Pageable pageable) {
        return userRepository.findAllUsersCustom(keyword, role, pageable)
                .map(this::convertToUserDTO);
    }

    @Override
    public List<Role> getAllRole() {
        return new ArrayList<>(List.of(Role.values()));
    }

    @Override
    @Transactional
    public UserDTO addUser(AdminRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username '" + request.getUsername() + "' already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email '" + request.getEmail() + "' already exists.");
        }

        if (request.getRole() == Role.ADMIN) {
            throw new ForbiddenException("You are not allowed to create an administrator.");
        }

        Users newUser = Users.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .name(request.getName())
                .role(request.getRole())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        Users savedUser = userRepository.save(newUser);
        return convertToUserDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUserRole(Long id, Role role) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (Role.ADMIN.equals(role) || user.getRole().equals(Role.ADMIN)) {
            throw new BadRequestException("Cannot change role to or from ADMIN.");
        }

        if (user.getRole().equals(role)) {
            throw new BadRequestException("User already has the role: " + role);
        }

        user.setRole(role);
        userRepository.save(user);
        return convertToUserDTO(user);
    }


    @Override
    @Transactional
    public String deleteUser(Long id, AdminPasswordRequest adminPassword) {
        Long adminId = SecurityUtils.getCurrentUserId();

        if (adminId == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        Users adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin user not found"));

        if (!passwordEncoder.matches(adminPassword.getAdminPassword(), adminUser.getPassword())) {
            throw new UnauthorizedException("Invalid password");
        }

        Users user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (Role.ADMIN.equals(user.getRole())) {
            throw new ForbiddenException("Cannot delete ADMIN.");
        }

        try {
            userRepository.delete(user);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Cannot delete account already has order history.");
        }
        return "User with username " + user.getUsername() + " has been deleted successfully.";
    }

    @Override
    @Transactional
    public UserDTO updateBanStatus(Long id, Boolean status) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (Role.ADMIN.equals(user.getRole())) {
            throw new ForbiddenException("Cannot ban ADMIN user.");
        }

        if (user.isBanned() == status) {
            throw new BadRequestException("User is already " + (status ? "banned." : "unbanned."));
        }

        user.setBanned(status);
        userRepository.save(user);
        return convertToUserDTO(user);
    }

    /**
     * Helper Method
     */

    private UserDTO convertToUserDTO(Users user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isBanned(user.isBanned())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
