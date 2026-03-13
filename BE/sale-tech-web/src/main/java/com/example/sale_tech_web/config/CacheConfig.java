package com.example.sale_tech_web.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Keep all cache policies in one place for easier tuning.
        List<CaffeineCache> caches = List.of(
                buildCache(CacheNames.CATEGORIES, Duration.ofHours(24), 20, 100),
                buildCache(CacheNames.FILTER_OPTIONS, Duration.ofHours(6), 50, 500),
                buildCache(CacheNames.PRODUCT_LIST_ALL, Duration.ofMinutes(30), 5, 50),
                buildCache(CacheNames.PRODUCT_BY_ID, Duration.ofMinutes(30), 200, 2000),
                buildCache(CacheNames.PRODUCT_BY_CATEGORY, Duration.ofMinutes(30), 50, 500),
                buildCache(CacheNames.PRODUCT_SEARCH, Duration.ofMinutes(5), 200, 1000)
        );

        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(caches);
        return manager;
    }

    private CaffeineCache buildCache(String cacheName, Duration ttl, int initialCapacity, long maximumSize) {
        return new CaffeineCache(
                cacheName,
                Caffeine.newBuilder()
                        .initialCapacity(initialCapacity)
                        .maximumSize(maximumSize)
                        .expireAfterWrite(ttl)
                        .build()
        );
    }
}

