package com.example.sale_tech_web.feature.notification.repository;

import com.example.sale_tech_web.feature.notification.entity.NotificationReadTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface NotificationReadTrackerRepository extends JpaRepository<NotificationReadTracker, Long> {

    // Kiểm tra xem User đã đọc 1 thông báo đại trà cụ thể chưa
    boolean existsByNotificationIdAndUserId(Long notificationId, Long userId);

    // Lọc ra các ID thông báo đại trà mà User ĐÃ ĐỌC từ một danh sách ID cho trước
    @Query("SELECT t.notificationId FROM NotificationReadTracker t " +
            "WHERE t.userId = :userId AND t.notificationId IN :notificationIds")
    Set<Long> findReadNotificationIds(@Param("userId") Long userId,
                                      @Param("notificationIds") List<Long> notificationIds);
}