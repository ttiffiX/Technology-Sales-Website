package com.example.sale_tech_web.feature.users.manager.admin;

import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.users.dto.admin.AdminPasswordRequest;
import com.example.sale_tech_web.feature.users.dto.admin.AdminRegisterRequest;
import com.example.sale_tech_web.feature.users.dto.admin.UserDTO;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.enums.Role;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class AdminService implements AdminServiceInterface {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::convertToUserDTO)
                .toList();
    }

    @Override
    public List<Role> getAllRole() {
        return new ArrayList<>(List.of(Role.values()));
    }

    @Override
    @Transactional
    public UserDTO addUser(AdminRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "Password and Confirm Password do not match.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(CONFLICT, "Username '" + request.getUsername() + "' already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Email '" + request.getEmail() + "' already exists.");
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
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "User not found."));

        if (Role.ADMIN.equals(role) || user.getRole().equals(Role.ADMIN)) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot change role to or from ADMIN.");
        }

        if (user.getRole().equals(role)) {
            throw new ResponseStatusException(BAD_REQUEST, "User already has the role: " + role);
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
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }

        Users adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Admin user not found"));

        if (!passwordEncoder.matches(adminPassword.getAdminPassword(), adminUser.getPassword())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid password");
        }

        Users user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found."));

        if (Role.ADMIN.equals(user.getRole())) {
            throw new ResponseStatusException(FORBIDDEN, "Cannot delete ADMIN.");
        }

        try {
            userRepository.delete(user);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(CONFLICT, "Cannot delete account already has order history.");
        }
        return "User with username " + user.getUsername() + " has been deleted successfully.";
    }

    @Override
    @Transactional
    public UserDTO updateBanStatus(Long id, Boolean status) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "User not found."));

        if (Role.ADMIN.equals(user.getRole())) {
            throw new ResponseStatusException(FORBIDDEN, "Cannot ban ADMIN user.");
        }

        if (user.isBanned() == status) {
            throw new ResponseStatusException(BAD_REQUEST, "User is already " + (status ? "banned." : "unbanned."));
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
