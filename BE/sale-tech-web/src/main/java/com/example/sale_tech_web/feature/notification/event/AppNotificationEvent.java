package com.example.sale_tech_web.feature.notification.event;

import com.example.sale_tech_web.feature.notification.enums.NotificationType;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AppNotificationEvent extends ApplicationEvent {
    private final NotificationType type;
    private final Long referenceId;
    private final String content;
    private final Long targetUserId; // null nếu là broadcast đại trà

    public AppNotificationEvent(Object source, NotificationType type, Long referenceId, String content, Long targetUserId) {
        super(source);
        this.type = type;
        this.referenceId = referenceId;
        this.content = content;
        this.targetUserId = targetUserId;
    }
}
