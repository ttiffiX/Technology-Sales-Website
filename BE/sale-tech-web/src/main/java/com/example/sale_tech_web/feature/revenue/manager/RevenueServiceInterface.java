package com.example.sale_tech_web.feature.revenue.manager;

import com.example.sale_tech_web.feature.revenue.enums.DateOption;
import com.example.sale_tech_web.feature.revenue.dto.*;
import com.example.sale_tech_web.feature.revenue.enums.TopProductSortBy;

import java.time.LocalDate;
import java.util.List;

public interface RevenueServiceInterface {
    /**
     * Lấy tổng doanh thu + số lượng đơn hàng COMPLETED/PAID
     * So sánh với period trước để tính growth %
     */
    RevenueTotalDTO getTotalRevenue(DateOption dateOption, Long categoryId);

    /**
     * Lấy doanh thu phân bổ theo danh mục (cho Pie Chart)
     * Kèm theo % tỷ trọng mỗi danh mục trong tổng doanh thu
     */
    CategoryRevenueDTO getCategoryRevenue(DateOption dateOption);

    /**
     * Lấy top 10 sản phẩm doanh thu cao nhất (cho Bar Chart)
     * Có thể sort theo REVENUE hoặc QUANTITY
     */
    TopProductDTO getTopProducts(DateOption dateOption, Long categoryId, TopProductSortBy sortBy);

    /**
     * Lấy doanh thu phân bổ theo phương thức thanh toán (VNPAY, CASH)
     * Kèm theo % tỷ trọng mỗi phương thức thanh toán
     */
    PaymentMethodRevenueDTO getRevenueByPaymentMethod(DateOption dateOption, Long categoryId);

    /**
     * Lấy tổng giá trị + số lượng đơn hàng PENDING/APPROVED/SHIPPING
     * Đây là doanh thu chờ xử lý, chưa hoàn tất
     */
    PendingRevenueDTO getPendingRevenue(DateOption dateOption, Long categoryId);

    /**
     * Lấy tỷ lệ hủy đơn hàng (CANCELLED orders vs Total orders)
     * Kèm theo thống kê doanh thu bị mất do hủy đơn
     */
    CancelRateDTO getCancelRate(DateOption dateOption, Long categoryId);

    /**
     * Lấy doanh thu theo giờ trong 1 ngày (cho Line Chart)
     * Hiển thị biểu đồ doanh thu theo giờ của ngày được chọn
     */
    List<DailyRevenuePointDTO> getDailyRevenue(LocalDate date, Long categoryId);
}
