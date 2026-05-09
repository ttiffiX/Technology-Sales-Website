package com.example.sale_tech_web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "cloudinaryExecutor")
    public Executor cloudinaryExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);      // Chạy song song 5 ảnh cùng lúc
        executor.setMaxPoolSize(10);     // Tối đa 10 ảnh nếu hàng đợi đầy
        executor.setQueueCapacity(500);  // Hàng đợi chờ xử lý
        executor.setThreadNamePrefix("Cloud-Upload-");
        executor.initialize();
        return executor;
    }
}