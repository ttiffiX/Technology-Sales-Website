package com.example.sale_tech_web.controller.admin;

import com.example.sale_tech_web.feature.users.dto.admin.AdminPasswordRequest;
import com.example.sale_tech_web.feature.users.dto.admin.AdminRegisterRequest;
import com.example.sale_tech_web.feature.users.dto.admin.UserDTO;
import com.example.sale_tech_web.feature.users.enums.Role;
import com.example.sale_tech_web.feature.users.manager.admin.AdminServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminServiceInterface adminServiceInterface;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        log.info("Admin - Get all users");
        List<UserDTO> users = adminServiceInterface.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        log.info("Admin - Get all roles");
        List<Role> roles = adminServiceInterface.getAllRole();
        return ResponseEntity.ok(roles);
    }

    @PostMapping("/users")
    public ResponseEntity<UserDTO> addUser(@Valid @RequestBody AdminRegisterRequest request) {
        log.info("Admin - Add user: username={}, role={}", request.getUsername(), request.getRole());
        return ResponseEntity.ok(adminServiceInterface.addUser(request));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long id, @RequestBody Role role) {
        log.info("Admin - Update user role: id={}, role={}", id, role);
        return ResponseEntity.ok(adminServiceInterface.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, @RequestBody AdminPasswordRequest adminPassword) {
        log.info("Admin - Delete user: id={}", id);
        return ResponseEntity.ok(adminServiceInterface.deleteUser(id, adminPassword));
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<UserDTO> updateBanStatus(@PathVariable Long id, @RequestParam Boolean status) {
        log.info("Admin - Update ban status: userId={}, status={}", id, status);
        return ResponseEntity.ok(adminServiceInterface.updateBanStatus(id, status));
    }
}
