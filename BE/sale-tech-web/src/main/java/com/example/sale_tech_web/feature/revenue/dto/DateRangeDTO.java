package com.example.sale_tech_web.feature.revenue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DateRangeDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private String label;
}

