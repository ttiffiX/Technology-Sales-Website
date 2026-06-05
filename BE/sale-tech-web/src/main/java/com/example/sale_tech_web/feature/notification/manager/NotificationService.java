package com.example.sale_tech_web.feature.notification.manager;

import com.example.sale_tech_web.exception.ForbiddenException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.exception.UnauthorizedException;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.notification.dto.NotificationResponseDTO;
import com.example.sale_tech_web.feature.notification.entity.Notification;
import com.example.sale_tech_web.feature.notification.entity.NotificationReadTracker;
import com.example.sale_tech_web.feature.notification.enums.NotificationType;
import com.example.sale_tech_web.feature.notification.repository.NotificationReadTrackerRepository;
import com.example.sale_tech_web.feature.notification.repository.NotificationRepository;
import com.example.sale_tech_web.feature.users.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService implements NotificationServiceInterface {

    private final NotificationRepository notificationRepository;
    private final NotificationReadTrackerRepository trackerRepository;

    @Override
    public Long getUnreadCount(Integer context) {
        Long userId = getUserIdFromToken();
        Role contextRole = checkRole(context);
        return notificationRepository.countUnreadNotification(userId, contextRole);
    }

    @Override
    public Page<NotificationResponseDTO> getNotifications(Integer context, NotificationType type, Pageable pageable) {
        Long userId = getUserIdFromToken();
        Role contextRole = checkRole(context);
        Page<Notification> notifications = notificationRepository.findNotificationsByContextAndType(userId, contextRole, type, pageable);

        List<Long> broadcastIds = notifications.stream()
                .filter(n -> n.getUserId() == null)
                .map(Notification::getId)
                .toList();
        // Query bảng tracker xem user đã đọc những cái nào trong đám broadcast này
        Set<Long> readBroadcastIds = Set.of();
        if (!broadcastIds.isEmpty()) {
            readBroadcastIds = trackerRepository.findReadNotificationIds(userId, broadcastIds);
        }

        Set<Long> finalReadBroadcastIds = readBroadcastIds;

        // Map sang DTO và ghi đè trạng thái isRead
        return notifications.map(notification -> {
            boolean isRead = notification.getUserId() == null
                    ? finalReadBroadcastIds.contains(notification.getId()) // Nếu là Broadcast -> Check Tracker
                    : notification.getIsRead();                            // Nếu là Direct -> Check chính nó

            return mapToDTO(notification, isRead);
        });
    }

    @Override
    @Transactional
    public void markAsReadAll(Integer context) {
        Long userId = getUserIdFromToken();
        Role contextRole = checkRole(context);

        // 1. Mark read toàn bộ tin đích danh
        notificationRepository.markAllDirectAsRead(userId, contextRole);

        // 2. Tìm toàn bộ tin đại trà chưa đọc và ném vào bảng Tracker
        List<Long> unreadBroadcastIds = notificationRepository.findUnreadBroadcastIds(userId, contextRole);

        if (!unreadBroadcastIds.isEmpty()) {
            List<NotificationReadTracker> trackers = unreadBroadcastIds.stream()
                    .map(id -> NotificationReadTracker.builder()
                            .notificationId(id)
                            .userId(userId)
                            .build())
                    .toList();
            trackerRepository.saveAll(trackers);
        }
    }

    @Override
    @Transactional
    public void markAsReadById(Integer context, Long notificationId) {
        Long userId = getUserIdFromToken();
        Role contextRole = checkRole(context);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));

        // Xác minh xem thông báo này có thuộc không gian (contextRole) hiện tại không
        if (notification.getTargetRole() != contextRole) {
            throw new ForbiddenException("Context role mismatch");
        }

        if (notification.getUserId() == null) {
            // Xử lý đọc cho Broadcast
            if (!trackerRepository.existsByNotificationIdAndUserId(notificationId, userId)) {
                trackerRepository.save(NotificationReadTracker.builder()
                        .notificationId(notificationId)
                        .userId(userId)
                        .build());
            }
        } else {
            // Xử lý đọc cho Direct
            if (!notification.getUserId().equals(userId)) {
                throw new ForbiddenException("Access denied");
            }
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        }
    }

    @Override
    public List<NotificationType> getAvailableTypes(Integer context) {
        Role contextRole = checkRole(context);

        return Arrays.stream(NotificationType.values())
                .filter(type -> type.getTargetRole() == contextRole)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Notification saveNotification(NotificationType type, Long referenceId, String content, Long targetUserId) {
        Notification notification = Notification.builder()
                .userId(targetUserId)
                .targetRole(type.getTargetRole())
                .type(type)
                .referenceId(referenceId)
                .content(content)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }


    // Hàm tiện ích để map dữ liệu
    private NotificationResponseDTO mapToDTO(Notification notification, boolean isRead) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .content(notification.getContent())
                .isRead(isRead) // Sử dụng isRead được truyền vào
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private Role checkRole(Integer context) {
        Role contextRole = Role.fromValue(context);
        Role role = SecurityUtils.getCurrentUserRole();

        List<Role> roles = Role.getRolesGreaterThanOrEqual(contextRole);
        if (!roles.contains(role)) {
            throw new ForbiddenException("Access denied");
        }
        return contextRole;
    }

    private Long getUserIdFromToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userId;
    }
}