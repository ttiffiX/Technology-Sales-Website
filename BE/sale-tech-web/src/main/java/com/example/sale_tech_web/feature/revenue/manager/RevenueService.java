package com.example.sale_tech_web.feature.revenue.manager;

import com.example.sale_tech_web.config.CacheNames;
import com.example.sale_tech_web.feature.revenue.entity.CategoryRevenueProjection;
import com.example.sale_tech_web.feature.revenue.entity.PaymentMethodRevenueProjection;
import com.example.sale_tech_web.feature.revenue.enums.DateOption;
import com.example.sale_tech_web.feature.revenue.dto.CancelRateDTO;
import com.example.sale_tech_web.feature.revenue.dto.CategoryRevenueDTO;
import com.example.sale_tech_web.feature.revenue.dto.DailyRevenuePointDTO;
import com.example.sale_tech_web.feature.revenue.dto.DateRangeDTO;
import com.example.sale_tech_web.feature.revenue.dto.PaymentMethodRevenueDTO;
import com.example.sale_tech_web.feature.revenue.dto.PendingRevenueDTO;
import com.example.sale_tech_web.feature.revenue.dto.RevenueCompareDTO;
import com.example.sale_tech_web.feature.revenue.dto.RevenueTotalDTO;
import com.example.sale_tech_web.feature.revenue.dto.TopProductDTO;
import com.example.sale_tech_web.feature.revenue.enums.TopProductSortBy;
import com.example.sale_tech_web.feature.revenue.repository.RevenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import com.example.sale_tech_web.feature.revenue.entity.HourlyRevenueProjection;

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
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'total:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name())")
    public RevenueTotalDTO getTotalRevenue(DateOption dateOption) {
        DateRangeDTO currentRange = resolveDateRange(dateOption);
        DateRangeDTO previousRange = resolvePreviousRange(dateOption);

        long currentRevenue = safeLong(revenueRepository.sumCompletedPaidRevenue(currentRange.getStartDate(), currentRange.getEndDate()));
        long previousRevenue = safeLong(revenueRepository.sumCompletedPaidRevenue(previousRange.getStartDate(), previousRange.getEndDate()));

        long totalCurrentOrders = safeLong(revenueRepository.countCompletedPaidOrders(currentRange.getStartDate(), currentRange.getEndDate()));
        long totalPreviousOrders = safeLong(revenueRepository.countCompletedPaidOrders(previousRange.getStartDate(), previousRange.getEndDate()));

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
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'pending'")
    public PendingRevenueDTO getPendingRevenue() {
        long pendingRevenue = safeLong(revenueRepository.sumPendingRevenue());
        long pendingOrders = safeLong(revenueRepository.countPendingOrders());

        return PendingRevenueDTO.builder()
                .pendingRevenue(pendingRevenue)
                .pendingOrders(pendingOrders)
                .build();
    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'cancel:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name())")
    public CancelRateDTO getCancelRate(DateOption dateOption) {
        DateRangeDTO range = resolveDateRange(dateOption);

        long cancelledRevenue = safeLong(revenueRepository.sumCancelledRevenue(range.getStartDate(), range.getEndDate()));
        long cancelledOrders = safeLong(revenueRepository.countCancelledOrders(range.getStartDate(), range.getEndDate()));
        long totalOrders = safeLong(revenueRepository.countTotalOrders(range.getStartDate(), range.getEndDate()));

        return CancelRateDTO.builder()
                .cancelledRevenue(cancelledRevenue)
                .cancelledOrders(cancelledOrders)
                .totalOrders(totalOrders)
                .cancellationRate(calculateRate(cancelledOrders, totalOrders))
                .range(range)
                .build();
    }

    //todo bỏ
    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'compare:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name())")
    public RevenueCompareDTO getRevenueCompare(DateOption dateOption) {
        DateRangeDTO currentRange = resolveDateRange(dateOption);
        DateRangeDTO previousRange = resolvePreviousRange(dateOption);

        long currentRevenue = safeLong(revenueRepository.sumCompletedPaidRevenue(currentRange.getStartDate(), currentRange.getEndDate()));
        long previousRevenue = safeLong(revenueRepository.sumCompletedPaidRevenue(previousRange.getStartDate(), previousRange.getEndDate()));

        return RevenueCompareDTO.builder()
                .currentRevenue(currentRevenue)
                .previousRevenue(previousRevenue)
                .growthPercentage(calculateGrowth(currentRevenue, previousRevenue))
                .currentRange(currentRange)
                .previousRange(previousRange)
                .build();
    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'daily:' + (#date == null ? T(java.time.LocalDate).now().toString() : #date.toString())")
    public List<DailyRevenuePointDTO> getDailyRevenue(LocalDate date) {
        List<HourlyRevenueProjection> rawRows = revenueRepository.findHourlyRevenue(date);
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
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'category:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name())")
    public List<CategoryRevenueDTO> getCategoryRevenue(DateOption dateOption) {
        DateRangeDTO range = resolveDateRange(dateOption);
        List<CategoryRevenueProjection> rawRows =
                revenueRepository.findCategoryRevenue(range.getStartDate(), range.getEndDate());

        long totalRevenue = rawRows.stream().mapToLong(row -> safeLong(row.getTotalRevenue())).sum();
        return rawRows.stream()
                .map(row -> CategoryRevenueDTO.builder()
                        .categoryId(row.getCategoryId())
                        .categoryName(row.getCategoryName())
                        .totalQuantitySold(safeLong(row.getTotalQuantitySold()))
                        .totalRevenue(safeLong(row.getTotalRevenue()))
                        .revenuePercentage(calculateRate(safeLong(row.getTotalRevenue()), totalRevenue))
                        .build())
                .toList();

    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'top:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name()) + ':' + (#categoryId == null ? 'ALL' : #categoryId) + ':' + (#sortBy == null ? 'REVENUE' : #sortBy.name())")
    public List<TopProductDTO> getTopProducts(DateOption dateOption, Long categoryId, TopProductSortBy sortBy) {
        DateRangeDTO range = resolveDateRange(dateOption);
        TopProductSortBy safeSortBy = sortBy == null ? TopProductSortBy.REVENUE : sortBy;

        return revenueRepository.findTopProducts(
                        range.getStartDate(),
                        range.getEndDate(),
                        categoryId,
                        safeSortBy.name(),
                        TOP_PRODUCT_LIMIT)
                .stream()
                .map(row -> TopProductDTO.builder()
                        .productId(row.getProductId())
                        .productTitle(row.getProductTitle())
                        .categoryId(row.getCategoryId())
                        .categoryName(row.getCategoryName())
                        .totalQuantitySold(safeLong(row.getTotalQuantitySold()))
                        .totalRevenue(safeLong(row.getTotalRevenue()))
                        .build())
                .toList();

    }

    @Override
    @Cacheable(value = CacheNames.REVENUE_ANALYTICS, key = "'pay-method:' + (#dateOption == null ? 'THIS_MONTH' : #dateOption.name()) + ':' + (#categoryId == null ? 'ALL' : #categoryId)")
    public List<PaymentMethodRevenueDTO> getRevenueByPaymentMethod(DateOption dateOption, Long categoryId) {
        DateRangeDTO range = resolveDateRange(dateOption);
        List<PaymentMethodRevenueProjection> rawRows =
                revenueRepository.findRevenueByPaymentMethod(range.getStartDate(), range.getEndDate(), categoryId);

        long totalRevenue = rawRows.stream().mapToLong(row -> safeLong(row.getTotalRevenue())).sum();
        return rawRows.stream()
                .map(row -> PaymentMethodRevenueDTO.builder()
                        .paymentMethod(row.getPaymentMethod())
                        .totalRevenue(safeLong(row.getTotalRevenue()))
                        .totalQuantitySold(safeLong(row.getTotalQuantitySold()))
                        .orderCount(safeLong(row.getOrderCount()))
                        .revenuePercentage(calculateRate(safeLong(row.getTotalRevenue()), totalRevenue))
                        .build())
                .toList();
    }
}

