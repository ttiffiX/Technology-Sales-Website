package com.example.sale_tech_web.feature.notification.repository;

import com.example.sale_tech_web.feature.notification.entity.Notification;
import com.example.sale_tech_web.feature.notification.enums.NotificationType;
import com.example.sale_tech_web.feature.users.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Đếm số thông báo chưa đọc của 1 User
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.targetRole = :contextRole " +
            "AND (" +
            "  (n.userId = :userId AND n.isRead = false) " +
            "  OR " +
            "  (n.userId IS NULL AND NOT EXISTS (" +
            "      SELECT 1 FROM NotificationReadTracker t " +
            "      WHERE t.notificationId = n.id AND t.userId = :userId" +
            "  ))" +
            ")")
    long countUnreadNotification(@Param("userId") Long userId,
                                 @Param("contextRole") Role contextRole);

    // Lấy danh sách thông báo có phân trang, hỗ trợ lọc theo Type (nếu type null thì lấy tất cả)
    @Query("SELECT n FROM Notification n " +
            "WHERE (n.userId = :userId OR n.userId IS NULL) " +
            "AND n.targetRole = :contextRole " +
            "AND (:type IS NULL OR n.type = :type)")
    Page<Notification> findNotificationsByContextAndType(
            @Param("userId") Long userId,
            @Param("contextRole") Role contextRole,
            @Param("type") NotificationType type,
            Pageable pageable);

    // Đánh dấu tất cả là đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true " +
            "WHERE n.userId = :userId AND n.targetRole = :contextRole AND n.isRead = false")
    void markAllDirectAsRead(@Param("userId") Long userId, @Param("contextRole") Role contextRole);

    // Tìm tất cả ID của tin đại trà CHƯA ĐỌC để chèn vào bảng Tracker
    @Query("SELECT n.id FROM Notification n WHERE n.userId IS NULL AND n.targetRole = :contextRole " +
            "AND NOT EXISTS (SELECT 1 FROM NotificationReadTracker t WHERE t.notificationId = n.id AND t.userId = :userId)")
    List<Long> findUnreadBroadcastIds(@Param("userId") Long userId, @Param("contextRole") Role contextRole);}