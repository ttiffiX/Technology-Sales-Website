package com.example.sale_tech_web.feature.order.enums;

import java.util.EnumMap;
import java.util.Map;

public enum OrderStatus {
    PENDING,
    APPROVED,
    SHIPPING,
    REJECTED,
    CANCELLED,
    COMPLETED;

    public static Map<OrderStatus, Integer> initStatusCountMap() {
        Map<OrderStatus, Integer> counts = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            counts.put(status, 0);
        }
        return counts;
    }
}

