package com.example.sale_tech_web.feature.notification.manager;

import com.example.sale_tech_web.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class SseNotificationService {

    //Key là userId, Value là kết nối SseEmitter
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    //Hàm để đăng ký kết nối
    public SseEmitter subscribe(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        // Cài đặt timeout cho kết nối SSE
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.put(userId, emitter);

        // Xử lý dọn dẹp RAM khi Frontend đóng tab hoặc mất mạng
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        // Gửi ngay 1 event kết nối thành công để xác nhận
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected successfully"));
        } catch (IOException e) {
            log.error("SseEmitter IO Exception", e);
            emitters.remove(userId);
        }

        return emitter;
    }

    //Hàm để bắn thông báo cho 1 user cụ thể
    public void sendNotificationToUser(Long userId, Object notificationPayload) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("NEW_NOTIFICATION")
                        .data(notificationPayload));
            } catch (IOException e) {
                log.error("SseEmitter IO Exception", e);
                emitters.remove(userId); // Nếu gửi lỗi (user đã tắt mạng ngầm), gỡ khỏi map
            }
        }
    }

    //Bắn thông báo cho một nhóm
    @Async("notificationExecutor")
    public void broadcastToPMs(Iterable<Long> pmUserIds, Object notificationPayload) {
        for (Long pmId : pmUserIds) {
            sendNotificationToUser(pmId, notificationPayload);
        }
    }

    @Async("notificationExecutor")
    @Scheduled(fixedRate = 30000) // 30s chạy 1 lần để giữ kết nối SSE luôn sống
    public void ping() {
        emitters.forEach((userId, emitter) -> {
            try {
                // Gửi sự kiện ping
                emitter.send(SseEmitter.event().name("ping").data("keep-alive"));
            } catch (Exception e) {
                // Nếu gửi lỗi (user đã đóng tab), gỡ bỏ khỏi map
                emitters.remove(userId);
            }
        });
    }
}