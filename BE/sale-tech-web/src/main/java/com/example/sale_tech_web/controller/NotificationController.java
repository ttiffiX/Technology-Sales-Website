package com.example.sale_tech_web.controller;

import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.notification.dto.NotificationResponseDTO;
import com.example.sale_tech_web.feature.notification.enums.NotificationType;
import com.example.sale_tech_web.feature.notification.manager.NotificationServiceInterface;
import com.example.sale_tech_web.feature.notification.manager.SseNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
@Slf4j
public class NotificationController {
    private final SseNotificationService sseNotificationService;
    private final NotificationServiceInterface notificationServiceInterface;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        return sseNotificationService.subscribe(currentUserId);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam("context") Integer context) {
        log.info("Getting unread count for userId: {}, contextRole: {}", SecurityUtils.getCurrentUserId(), context);
        long count = notificationServiceInterface.getUnreadCount(context);
        return ResponseEntity.ok(count);
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponseDTO>> getNotifications(
            @RequestParam("context") Integer context,
            @RequestParam(required = false) NotificationType type,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting notifications for userId: {}, contextRole: {}, type: {}, pageable: {}", SecurityUtils.getCurrentUserId(), context, type, pageable);
        Page<NotificationResponseDTO> notifications = notificationServiceInterface.getNotifications(context, type, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/types")
    public ResponseEntity<List<NotificationType>> getAvailableTypes(@RequestParam("context") Integer context) {
        log.info("Getting types for userId: {}, contextRole: {}", SecurityUtils.getCurrentUserId(), context);
        List<NotificationType> types = notificationServiceInterface.getAvailableTypes(context);
        return ResponseEntity.ok(types);
    }

    // Đánh dấu tất cả là đã đọc
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(@RequestParam("context") Integer context) {
        log.info("Marking all as read for userId: {}, contextRole: {}", SecurityUtils.getCurrentUserId(), context);
        notificationServiceInterface.markAsReadAll(context);
        return ResponseEntity.ok("All notifications marked as read");
    }

    // Đánh dấu 1 thông báo cụ thể là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsReadById(
            @PathVariable Long id,
            @RequestParam("context") Integer context) {
        log.info("Marking as read for notification ID {} for userId: {}, contextRole: {}", id, SecurityUtils.getCurrentUserId(), context);
        notificationServiceInterface.markAsReadById(context, id);
        return ResponseEntity.ok("Notification marked as read");
    }
}
