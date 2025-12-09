package com.example.sale_tech_web.feature.users.manager;

import com.example.sale_tech_web.controller.exception.ClientException;
import com.example.sale_tech_web.feature.users.dto.LogInRequest;
import com.example.sale_tech_web.feature.users.dto.RegisterRequest;
import com.example.sale_tech_web.feature.users.dto.LogInResponse;
import com.example.sale_tech_web.feature.cart.entity.Cart;
import com.example.sale_tech_web.feature.cart.repository.CartRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.enums.Role;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import com.example.sale_tech_web.feature.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static com.example.sale_tech_web.utils.CheckUtils.isStrongPassword;
import static com.example.sale_tech_web.utils.CheckUtils.isValidEmail;

@Service
@RequiredArgsConstructor
public class UserService implements UserServiceInterface {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final CartRepository cartRepository;

    @Override
    public LogInResponse login(LogInRequest logInRequest) {
        Users users = userRepository.findByUsername(logInRequest.getUsername()).orElseThrow(() -> new ClientException("User not found"));
        if (!passwordEncoder.matches(logInRequest.getPassword(), users.getPassword())) {
            throw new ClientException("Invalid username or password");
        }

        String token = jwtUtils.generateToken(users.getId());
        return LogInResponse.builder()
                .token(token)
                .username(users.getUsername())
                .name(users.getName())
                .imageUrl(users.getImageUrl())
                .build();
    }

    @Override
    @Transactional
    public String createUser(RegisterRequest registerRequest) {
        String username = registerRequest.getUsername();
        String password = registerRequest.getPassword();
        String email = registerRequest.getEmail();

        if (username == null || username.trim().isEmpty() ||
                password == null || password.isEmpty() ||
                email == null || email.trim().isEmpty()) {
            throw new ClientException("Username, password, and email must not be empty.");
        }

        // 2. Kiểm tra Tính hợp lệ của Dữ liệu (Dùng Regex nếu cần)
        // Ví dụ: Kiểm tra định dạng email và độ mạnh của mật khẩu
        if (!isValidEmail(email)) {
            throw new ClientException("Invalid email format.");
        }

        if (!isStrongPassword(password)) {
            throw new ClientException("Password is too weak! It must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.");
        }

        if (!password.equals(registerRequest.getConfirmPassword())) {
            throw new ClientException("Password and Confirm Password do not match.");
        }

        // 3. Kiểm tra Tồn tại (Unique Constraint Check)
        if (userRepository.existsByUsername(username)) {
            throw new ClientException("Username '" + username + "' already exists.");
        }

        // Nên kiểm tra email riêng để cung cấp thông báo lỗi chi tiết hơn (nếu bảo mật cho phép)
        if (userRepository.existsByEmail(email)) {
            throw new ClientException("Email '" + email + "' already exists.");
        }

        // 4. Mã hóa Mật khẩu và Xây dựng Đối tượng
        Users users = Users.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(password))
                .phone(registerRequest.getPhone())
                .name(registerRequest.getName())
                .role(Role.CUSTOMER.getValue())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        // 5. Lưu User
        userRepository.save(users);

        // 6. Tạo Cart cho User ngay sau khi đăng ký
        // Vì thiết kế có userId trong Cart table (UNIQUE constraint)
        Cart cart = Cart.builder()
                .user(users)
                .updatedAt(LocalDateTime.now())
                .build();

        cartRepository.save(cart);
        return "Register Successfully";
    }
}
