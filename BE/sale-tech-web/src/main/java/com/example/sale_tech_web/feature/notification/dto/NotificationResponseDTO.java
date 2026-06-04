package com.example.sale_tech_web.feature.notification.dto;

import com.example.sale_tech_web.feature.notification.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Long id;
    private NotificationType type;
    private Long referenceId; // Chứa ID của Order hoặc Review để FE tự navigate
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}