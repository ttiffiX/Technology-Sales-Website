package com.example.sale_tech_web.feature.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueCompareDTO {
    private Long currentRevenue;
    private Long previousRevenue;
    private Double growthPercentage;
    private DateRangeDTO currentRange;
    private DateRangeDTO previousRange;
}

