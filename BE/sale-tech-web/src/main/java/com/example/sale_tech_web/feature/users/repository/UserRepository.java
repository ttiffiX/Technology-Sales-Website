package com.example.sale_tech_web.feature.users.repository;

import com.example.sale_tech_web.feature.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);

    @Query("SELECT u FROM Users u WHERE u.username = :input OR u.email = :input")
    Optional<Users> findByUsernameOrEmail(@Param("input") String input);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    /**
     *
     * @param cutoffTime Thời điểm cutoff (VD: 24 giờ trước)
     * @return Danh sách users chưa active và quá hạn
     */
    @Query("SELECT u FROM Users u WHERE u.isActive = false AND u.createdAt < :cutoffTime")
    List<Users> findInactiveUsersOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
}



