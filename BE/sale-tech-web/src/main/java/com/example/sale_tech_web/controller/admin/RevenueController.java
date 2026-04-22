package com.example.sale_tech_web.controller.admin;

import com.example.sale_tech_web.feature.revenue.dto.*;
import com.example.sale_tech_web.feature.revenue.enums.DateOption;
import com.example.sale_tech_web.feature.revenue.enums.TopProductSortBy;
import com.example.sale_tech_web.feature.revenue.manager.RevenueServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/revenue")
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class RevenueController {
    private final RevenueServiceInterface revenueServiceInterface;

    @GetMapping("/total")
    public ResponseEntity<RevenueTotalDTO> getTotalRevenue(
            @RequestParam(required = false) DateOption dateOption,
            @RequestParam(required = false) Long categoryId) {
        log.info("Revenue - Get total revenue: dateOption={}, categoryId={}", dateOption, categoryId);
        return ResponseEntity.ok(revenueServiceInterface.getTotalRevenue(dateOption, categoryId));
    }

    @GetMapping("/pending")
    public ResponseEntity<PendingRevenueDTO> getPendingRevenue(
            @RequestParam(required = false) DateOption dateOption,
            @RequestParam(required = false) Long categoryId) {
        log.info("Revenue - Get pending revenue: dateOption={}, categoryId={}", dateOption, categoryId);
        return ResponseEntity.ok(revenueServiceInterface.getPendingRevenue(dateOption, categoryId));
    }

    @GetMapping("/cancel-rate")
    public ResponseEntity<CancelRateDTO> getCancelRate(
            @RequestParam(required = false) DateOption dateOption,
            @RequestParam(required = false) Long categoryId) {
        log.info("Revenue - Get cancel rate: dateOption={}, categoryId={}", dateOption, categoryId);
        return ResponseEntity.ok(revenueServiceInterface.getCancelRate(dateOption, categoryId));
    }

    @GetMapping("/daily")
    public ResponseEntity<List<DailyRevenuePointDTO>> getDailyRevenue(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
            @RequestParam(required = false) Long categoryId) {
        LocalDate targetDate = date == null ? LocalDate.now() : date;
        log.info("Revenue - Get daily revenue chart: date={}, categoryId={}", targetDate, categoryId);
        return ResponseEntity.ok(revenueServiceInterface.getDailyRevenue(targetDate, categoryId));
    }

    @GetMapping("/category")
    public ResponseEntity<CategoryRevenueDTO> getCategoryRevenue(
            @RequestParam(required = false) DateOption dateOption) {
        log.info("Revenue - Get category revenue: dateOption={}", dateOption);
        return ResponseEntity.ok(revenueServiceInterface.getCategoryRevenue(dateOption));
    }

    @GetMapping("/top-products")
    public ResponseEntity<TopProductDTO> getTopProducts(
            @RequestParam(required = false) DateOption dateOption,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) TopProductSortBy sortBy) {
        log.info("Revenue - Get top products: dateOption={}, categoryId={}, sortBy={}", dateOption, categoryId, sortBy);
        return ResponseEntity.ok(revenueServiceInterface.getTopProducts(dateOption, categoryId, sortBy));
    }

    @GetMapping("/payment-method")
    public ResponseEntity<PaymentMethodRevenueDTO> getRevenueByPaymentMethod(
            @RequestParam(required = false) DateOption dateOption,
            @RequestParam(required = false) Long categoryId) {
        log.info("Revenue - Get payment method revenue: dateOption={}, categoryId={}", dateOption, categoryId);
        return ResponseEntity.ok(revenueServiceInterface.getRevenueByPaymentMethod(dateOption, categoryId));
    }
}

