package com.example.sale_tech_web.feature.notification.event;

import com.example.sale_tech_web.feature.notification.entity.Notification;
import com.example.sale_tech_web.feature.notification.manager.NotificationServiceInterface;
import com.example.sale_tech_web.feature.notification.manager.SseNotificationService;
import com.example.sale_tech_web.feature.users.enums.Role;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {
    private final NotificationServiceInterface notificationServiceInterface;
    private final SseNotificationService sseNotificationService;
    private final UserRepository userRepository;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAppNotification(AppNotificationEvent event) {
        try {

            Notification notification = notificationServiceInterface.saveNotification(event.getType(), event.getReferenceId(), event.getContent(), event.getTargetUserId());

            log.info("{} Notification #{} will be sent | Dest: {} | ROLES: {} | TYPE: {} | REF_ID: {}",
                    notification.getUserId() == null ? "[BROADCAST]" : "[DIRECT]",
                    notification.getId(),
                    notification.getUserId() == null ? "All appropriate users" : "User #" + notification.getUserId(),
                    notification.getTargetRole(),
                    notification.getType(),
                    notification.getReferenceId());

            if (notification.getUserId() == null) {
                List<Role> roles = Role.getRolesGreaterThanOrEqual(event.getType().getTargetRole());
                List<Long> userIds = userRepository.findAllUserIdsByRole(roles);
                sseNotificationService.broadcastToPMs(userIds, notification.getContent());
            } else {
                sseNotificationService.sendNotificationToUser(notification.getUserId(), notification.getContent());
            }
        } catch (Exception e) {
            log.error("Exception occurred while sending notification: {}", e.getMessage());
        }
    }
}
