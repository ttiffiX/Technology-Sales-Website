package com.example.sale_tech_web.feature.users.manager;

import com.example.sale_tech_web.feature.email.config.AccountCleanupConfig;
import com.example.sale_tech_web.feature.email.entity.EmailVerificationToken;
import com.example.sale_tech_web.feature.email.manager.EmailService;
import com.example.sale_tech_web.feature.email.repository.EmailVerificationTokenRepository;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.users.dto.ChangePassRequest;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.*;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserServiceInterface {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final CartRepository cartRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final EmailService emailService;

    @Override
    public LogInResponse login(LogInRequest logInRequest) {
        Users users = userRepository.findByUsername(logInRequest.getUsername()).orElseThrow(() -> new ResponseStatusException(CONFLICT, "Invalid username or password"));
        if (!passwordEncoder.matches(logInRequest.getPassword(), users.getPassword())) {
            throw new ResponseStatusException(CONFLICT, "Invalid username or password");
        }

        if (!users.isActive()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Email is not verified. Please verify your email before logging in.");
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

        if (!password.equals(registerRequest.getConfirmPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "Password and Confirm Password do not match.");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(CONFLICT, "Username '" + username + "' already exists.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(CONFLICT, "Email '" + email + "' already exists.");
        }

        Users users = Users.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(password))
                .phone(registerRequest.getPhone())
                .name(registerRequest.getName())
                .role(Role.CUSTOMER)
                .isActive(false)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(users);

        Cart cart = Cart.builder()
                .user(users)
                .updatedAt(LocalDateTime.now())
                .build();

        cartRepository.save(cart);

        // Tạo verification token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(users)
                .expiryDate(LocalDateTime.now().plusMinutes(AccountCleanupConfig.EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES))
                .isUsed(false)
                .lastSent(LocalDateTime.now())
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        // Gửi email
        emailService.sendVerificationEmail(email, token);

        return "Register Successfully";
    }

    @Override
    public String changePassword(ChangePassRequest changePassRequest) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User is not authenticated");
        }

        Users users = userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(changePassRequest.getOldPassword(), users.getPassword())) {
            throw new ResponseStatusException(CONFLICT, "Old password is incorrect");
        }

        if (!changePassRequest.getNewPassword().equals(changePassRequest.getConfirmPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "New password and confirm new password do not match");
        }

        users.setPassword(passwordEncoder.encode(changePassRequest.getNewPassword()));
        userRepository.save(users);
        return "Password changed successfully";
    }

    @Override
    @Transactional
    public String verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Invalid verification token"));

        if (verificationToken.isUsed()) {
            throw new ResponseStatusException(CONFLICT, "Token has already been used");
        }

        if (LocalDateTime.now().isAfter(verificationToken.getExpiryDate())) {
            throw new ResponseStatusException(HttpStatus.GONE, "TOKEN EXPIRED");
        }

        Users user = verificationToken.getUser();
        user.setActive(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        emailVerificationTokenRepository.delete(verificationToken);

        return "Email verified successfully! You can now login.";
    }

    @Override
    @Transactional
    public String resendVerificationEmail(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (user.isActive()) {
            throw new ResponseStatusException(CONFLICT, "Email already verified");
        }

        // Kiểm tra account đã quá 24h chưa
        LocalDateTime cutoffTime = LocalDateTime.now()
                .minusHours(AccountCleanupConfig.UNVERIFIED_ACCOUNT_MAX_AGE_HOURS);
        if (user.getCreatedAt().isBefore(cutoffTime)) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "Account registration expired. Please register again.");
        }

        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByUserId(user.getId())
                .orElse(new EmailVerificationToken());

        // Kiểm tra rate limiting - chỉ cho phép gửi lại sau 60 giây
        if (verificationToken.getLastSent() != null) {
            LocalDateTime cooldownExpiry = verificationToken.getLastSent()
                    .plusSeconds(AccountCleanupConfig.RESEND_VERIFICATION_COOLDOWN_SECONDS);
            if (LocalDateTime.now().isBefore(cooldownExpiry)) {
                long secondsRemaining = Duration.between(LocalDateTime.now(), cooldownExpiry).getSeconds();
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        String.format("Please wait %d seconds before requesting another verification email", secondsRemaining));
            }
        }

        verificationToken.setUser(user);
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(AccountCleanupConfig.EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES));
        verificationToken.setUsed(false);
        verificationToken.setLastSent(LocalDateTime.now());

        emailVerificationTokenRepository.save(verificationToken);

        // Gửi email mới
        emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());

        return "Verification email has been resent. Please check your inbox.";
    }

    @Override
    @Transactional
    public String forgotPassword(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "No account found with this email address"));

        if (!user.isActive()) {
            throw new ResponseStatusException(CONFLICT, "Email is not verified. Please verify your email first.");
        }

        // Generate random temporary password (8 characters with numbers, letters, and special chars)
        String tempPassword = generateRandomPassword();

        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // Send email with new password
        emailService.sendPasswordResetEmail(user.getEmail(), tempPassword);

        return "A temporary password has been sent to your email address. Please check your inbox.";
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&+=!";
        StringBuilder password = new StringBuilder();
        SecureRandom random = new SecureRandom();

        // Ensure password has at least one of each required type
        password.append("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(random.nextInt(26))); // Upper
        password.append("abcdefghijklmnopqrstuvwxyz".charAt(random.nextInt(26))); // Lower
        password.append("0123456789".charAt(random.nextInt(10))); // Digit
        password.append("@#$%^&+=!".charAt(random.nextInt(9))); // Special

        // Fill remaining 4 characters randomly
        for (int i = 0; i < 4; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        // Shuffle the password
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }

        return new String(passwordArray);
    }
}
