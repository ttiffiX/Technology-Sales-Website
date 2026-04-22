package com.example.sale_tech_web.feature.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingRevenueDTO {
    private Long pendingRevenue;
    private Long pendingOrders;
    private DateRangeDTO range;
}

