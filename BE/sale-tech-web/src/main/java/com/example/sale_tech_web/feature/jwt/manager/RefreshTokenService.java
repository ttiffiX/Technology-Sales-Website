package com.example.sale_tech_web.feature.jwt.manager;

import com.example.sale_tech_web.feature.jwt.JwtUtils;
import com.example.sale_tech_web.feature.jwt.entity.RefreshToken;
import com.example.sale_tech_web.feature.jwt.repository.RefreshTokenRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtils jwtUtils;

    @Value("${jwt.refresh-expiration}")
    private long jwtRefreshExp;

    @Transactional
    public RefreshToken createRefreshToken(Users user) {
        // Xóa tất cả refresh token cũ của user (1 user = 1 refresh token tại 1 thời điểm)
        refreshTokenRepository.deleteAllByUser(user);

        String tokenValue = jwtUtils.generateRefreshToken(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryAt(LocalDateTime.now().plusSeconds(jwtRefreshExp / 1000))
                .isRevoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public String refreshAccessToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found"));

        if (refreshToken.isRevoked()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }

        if (refreshToken.getExpiryAt().isBefore(LocalDateTime.now())) {
            // Xóa token hết hạn
            refreshTokenRepository.delete(refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has expired, please login again");
        }

        if (!jwtUtils.validateToken(refreshTokenValue)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        Users user = refreshToken.getUser();
        return jwtUtils.generateToken(user.getId(), user.getRole().name());
    }

    @Transactional
    public void revokeRefreshToken(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllUserTokens(Users user) {
        refreshTokenRepository.deleteAllByUser(user);
    }
}

