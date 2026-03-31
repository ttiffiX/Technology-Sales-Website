package com.example.sale_tech_web.feature.order.dto;

import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StatusCountDTO {
    private Map<OrderStatus, Integer> orderStatusCountMap;
    private Integer totalStatusCount;
}
