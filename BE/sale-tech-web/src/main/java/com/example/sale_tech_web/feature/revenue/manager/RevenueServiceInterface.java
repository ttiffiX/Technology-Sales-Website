package com.example.sale_tech_web.feature.revenue.manager;

import com.example.sale_tech_web.feature.revenue.enums.DateOption;
import com.example.sale_tech_web.feature.revenue.dto.CancelRateDTO;
import com.example.sale_tech_web.feature.revenue.dto.CategoryRevenueDTO;
import com.example.sale_tech_web.feature.revenue.dto.DailyRevenuePointDTO;
import com.example.sale_tech_web.feature.revenue.dto.PaymentMethodRevenueDTO;
import com.example.sale_tech_web.feature.revenue.dto.PendingRevenueDTO;
import com.example.sale_tech_web.feature.revenue.dto.RevenueCompareDTO;
import com.example.sale_tech_web.feature.revenue.dto.RevenueTotalDTO;
import com.example.sale_tech_web.feature.revenue.dto.TopProductDTO;
import com.example.sale_tech_web.feature.revenue.enums.TopProductSortBy;

import java.time.LocalDate;
import java.util.List;

public interface RevenueServiceInterface {
    /**
     * Lấy tất cả các đơn hàng có trạng thái COMPLETED
     * và đã thanh toán (PAID) theo ngày, tuần, tháng, năm.
     */
    RevenueTotalDTO getTotalRevenue(DateOption dateOption);

    /**
     * Lấy tất cả các đơn hàng có trạng thái PENDING, APPROVED, SHIPPING.
     */
    PendingRevenueDTO getPendingRevenue();

    /**
     * Lấy tất cả các đơn hàng có trạng thái CANCELLED theo ngày, tuần, tháng, năm.
     */
    CancelRateDTO getCancelRate(DateOption dateOption);

    /**
     * Tính % tăng trưởng doanh thu so với chu kỳ trước (Ngày, Tuần, Tháng, Năm).
     */
    RevenueCompareDTO getRevenueCompare(DateOption dateOption);

    /**
     * Data cho Line Chart (Doanh thu theo thời gian của 1 ngày).
     * Chọn 1 ngày cụ thể, hệ thống hiển thị biểu đồ doanh thu theo giờ trong ngày đó.
     */
    List<DailyRevenuePointDTO> getDailyRevenue(LocalDate date);

    /**
     * Data cho Pie Chart (Tỷ trọng doanh thu theo danh mục theo ngày, tuần, tháng, năm).
     */
    List<CategoryRevenueDTO> getCategoryRevenue(DateOption dateOption);

    /**
     * Data cho Bar Chart (Top 10 sản phẩm doanh thu cao nhất theo ngày, tuần, tháng, năm và có thể lọc theo categoryId).
     */
    List<TopProductDTO> getTopProducts(DateOption dateOption, Long categoryId, TopProductSortBy sortBy);

    /**
     * Phân tích tỷ trọng phương thức thanh toán (VNPAY vs CASH) theo ngày, tuần, tháng, năm và có thể lọc theo category.
     */
    List<PaymentMethodRevenueDTO> getRevenueByPaymentMethod(DateOption dateOption, Long categoryId);
}
