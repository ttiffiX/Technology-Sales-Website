package com.example.sale_tech_web.feature.revenue.manager;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.revenue.entity.*;
import com.example.sale_tech_web.feature.revenue.enums.DateOption;
import com.example.sale_tech_web.feature.revenue.dto.*;
import com.example.sale_tech_web.feature.revenue.entity.HourlyRevenueProjection;
import com.example.sale_tech_web.feature.revenue.enums.TopProductSortBy;
import com.example.sale_tech_web.feature.revenue.repository.RevenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.example.sale_tech_web.feature.revenue.enums.DateOption.resolveDateRange;
import static com.example.sale_tech_web.feature.revenue.enums.DateOption.resolvePreviousRange;
import static com.example.sale_tech_web.utils.MathUtils.*;

@Service
@RequiredArgsConstructor
public class RevenueService implements RevenueServiceInterface {
    private static final int TOP_PRODUCT_LIMIT = 10;
    private final RevenueRepository revenueRepository;

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'total:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name()) + ':' + (#categoryId == null ? 'ALL' : #categoryId)")
    public RevenueTotalDTO getTotalRevenue(DateOption dateOption, Long categoryId) {
        DateRangeDTO currentRange = resolveDateRange(dateOption);
        DateRangeDTO previousRange = resolvePreviousRange(dateOption);

        TotalRevenueProjection currentResult = revenueRepository.getRevenueAndOrderCount(
                currentRange.getStartDate(),
                currentRange.getEndDate(),
                categoryId
        );
        long currentRevenue = safeLong(currentResult.getTotalRevenue());
        long totalCurrentOrders = safeLong(currentResult.getOrderCount());

        TotalRevenueProjection previousResult = revenueRepository.getRevenueAndOrderCount(
                previousRange.getStartDate(),
                previousRange.getEndDate(),
                categoryId
        );
        long previousRevenue = safeLong(previousResult.getTotalRevenue());
        long totalPreviousOrders = safeLong(previousResult.getOrderCount());

        return RevenueTotalDTO.builder()
                .currentRevenue(currentRevenue)
                .previousRevenue(previousRevenue)
                .growthPercentage(calculateGrowth(currentRevenue, previousRevenue))
                .currentRange(currentRange)
                .previousRange(previousRange)
                .totalCurrentOrders(totalCurrentOrders)
                .totalPreviousOrders(totalPreviousOrders)
                .build();
    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'pending:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name()) + ':' + (#categoryId == null ? 'ALL' : #categoryId)")
    public PendingRevenueDTO getPendingRevenue(DateOption dateOption, Long categoryId) {
        DateRangeDTO range = resolveDateRange(dateOption);

        PendingRevenueStatsProjection result = revenueRepository.getPendingRevenueAndOrderCount(
                range.getStartDate(),
                range.getEndDate(),
                categoryId
        );
        long pendingRevenue = safeLong(result.getPendingRevenue());
        long pendingOrders = safeLong(result.getPendingOrders());

        return PendingRevenueDTO.builder()
                .pendingRevenue(pendingRevenue)
                .pendingOrders(pendingOrders)
                .range(range)
                .build();
    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'cancel:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name()) + ':' + (#categoryId == null ? 'ALL' : #categoryId)")
    public CancelRateDTO getCancelRate(DateOption dateOption, Long categoryId) {
        DateRangeDTO range = resolveDateRange(dateOption);

        // GROUP 2: Unified query lấy cancelled revenue + cancelled orders + total orders
        CancelRateStatsProjection result = revenueRepository.getCancelledAndTotalOrderStats(
                range.getStartDate(),
                range.getEndDate(),
                categoryId
        );
        long cancelledRevenue = safeLong(result.getCancelledRevenue());
        long cancelledOrders = safeLong(result.getCancelledOrders());
        long totalOrders = safeLong(result.getTotalOrders());

        return CancelRateDTO.builder()
                .cancelledRevenue(cancelledRevenue)
                .cancelledOrders(cancelledOrders)
                .totalOrders(totalOrders)
                .cancellationRate(calculateRate(cancelledOrders, totalOrders))
                .range(range)
                .build();
    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'daily:' + (#date == null ? T(java.time.LocalDate).now().toString() : #date.toString()) + ':' + (#categoryId == null ? 'ALL' : #categoryId)")
    public List<DailyRevenuePointDTO> getDailyRevenue(LocalDate date, Long categoryId) {
        List<HourlyRevenueProjection> rawRows = revenueRepository.findHourlyRevenue(date, categoryId);
        Map<Integer, HourlyRevenueProjection> byHour = rawRows.stream()
                .collect(Collectors.toMap(HourlyRevenueProjection::getHour, Function.identity()));

        List<DailyRevenuePointDTO> result = new ArrayList<>(24);
        for (int hour = 0; hour < 24; hour++) {
            HourlyRevenueProjection data = byHour.get(hour);
            result.add(DailyRevenuePointDTO.builder()
                    .hour(hour)
                    .revenue(data == null ? 0L : safeLong(data.getRevenue()))
                    .orderCount(data == null ? 0L : safeLong(data.getOrderCount()))
                    .build());
        }

        return result;
    }

    @Override
    public CategoryRevenueDTO getCategoryRevenue(DateOption dateOption) {
        DateRangeDTO range = resolveDateRange(dateOption);
        List<CategoryRevenueProjection> rawRows =
                revenueRepository.findCategoryRevenue(range.getStartDate(), range.getEndDate());

        long totalRevenue = rawRows.stream().mapToLong(row -> safeLong(row.getTotalRevenue())).sum();

        List<CategoryRevenueDTO.CategoryRevenue> categoryRevenuesList;
        categoryRevenuesList = rawRows.stream()
                .map(row -> CategoryRevenueDTO.CategoryRevenue.builder()
                        .categoryId(row.getCategoryId())
                        .categoryName(row.getCategoryName())
                        .totalQuantitySold(safeLong(row.getTotalQuantitySold()))
                        .totalRevenue(safeLong(row.getTotalRevenue()))
                        .revenuePercentage(calculateRate(safeLong(row.getTotalRevenue()), totalRevenue))
                        .build())
                .toList();

        return CategoryRevenueDTO.builder()
                .categoryRevenues(categoryRevenuesList)
                .range(range)
                .build();
    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'top:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name()) + ':' + (#categoryId == null ? 'ALL' : #categoryId) + ':' + (#sortBy == null ? 'REVENUE' : #sortBy.name())")
    public TopProductDTO getTopProducts(DateOption dateOption, Long categoryId, TopProductSortBy sortBy) {
        DateRangeDTO range = resolveDateRange(dateOption);
        TopProductSortBy safeSortBy = sortBy == null ? TopProductSortBy.REVENUE : sortBy;

        List<TopProductDTO.TopProduct> topProducts;
        topProducts = revenueRepository.findTopProducts(
                        range.getStartDate(),
                        range.getEndDate(),
                        categoryId,
                        safeSortBy.name(),
                        TOP_PRODUCT_LIMIT)
                .stream()
                .map(row -> TopProductDTO.TopProduct.builder()
                        .productId(row.getProductId())
                        .productTitle(row.getProductTitle())
                        .categoryId(row.getCategoryId())
                        .categoryName(row.getCategoryName())
                        .totalQuantitySold(safeLong(row.getTotalQuantitySold()))
                        .totalRevenue(safeLong(row.getTotalRevenue()))
                        .build())
                .toList();

        return TopProductDTO.builder()
                .topProducts(topProducts)
                .range(range)
                .build();
    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'pay-method:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name()) + ':' + (#categoryId == null ? 'ALL' : #categoryId)")
    public PaymentMethodRevenueDTO getRevenueByPaymentMethod(DateOption dateOption, Long categoryId) {
        DateRangeDTO range = resolveDateRange(dateOption);
        List<PaymentMethodRevenueProjection> rawRows =
                revenueRepository.findRevenueByPaymentMethod(range.getStartDate(), range.getEndDate(), categoryId);

        long totalRevenue = rawRows.stream().mapToLong(row -> safeLong(row.getTotalRevenue())).sum();

        List<PaymentMethodRevenueDTO.PaymentMethodRevenue> paymentMethodRevenues;
        paymentMethodRevenues = rawRows.stream()
                .map(row -> PaymentMethodRevenueDTO.PaymentMethodRevenue.builder()
                        .paymentMethod(row.getPaymentMethod())
                        .totalRevenue(safeLong(row.getTotalRevenue()))
                        .totalQuantitySold(safeLong(row.getTotalQuantitySold()))
                        .orderCount(safeLong(row.getOrderCount()))
                        .revenuePercentage(calculateRate(safeLong(row.getTotalRevenue()), totalRevenue))
                        .build())
                .toList();

        return PaymentMethodRevenueDTO.builder()
                .paymentMethodRevenues(paymentMethodRevenues)
                .range(range)
                .build();
    }
}

