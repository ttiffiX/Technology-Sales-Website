package com.example.sale_tech_web.feature.notification.manager;

import com.example.sale_tech_web.feature.notification.dto.NotificationResponseDTO;
import com.example.sale_tech_web.feature.notification.entity.Notification;
import com.example.sale_tech_web.feature.notification.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationServiceInterface {
    Long getUnreadCount(Integer context);

    Page<NotificationResponseDTO> getNotifications(Integer context, NotificationType type, Pageable pageable);

    void markAsReadAll(Integer context);

    void markAsReadById(Integer context, Long notificationId);

    List<NotificationType> getAvailableTypes(Integer context);

    Notification saveNotification(NotificationType type, Long referenceId, String content, Long targetUserId);
}