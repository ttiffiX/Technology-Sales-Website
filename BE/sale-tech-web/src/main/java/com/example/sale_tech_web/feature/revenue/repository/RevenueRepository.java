package com.example.sale_tech_web.feature.revenue.repository;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.revenue.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RevenueRepository extends JpaRepository<Order, Long> {
    /**
     * Lấy tổng revenue + order count
     */
    @Query(value = """
            SELECT
                COALESCE(SUM(CAST(total_revenue AS BIGINT)), 0) AS totalRevenue,
                COALESCE(COUNT(DISTINCT order_id), 0) AS orderCount
            FROM view_revenue_analytics
            WHERE report_date BETWEEN :startDate AND :endDate
              AND (:categoryId IS NULL OR category_id = :categoryId)
            """, nativeQuery = true)
    TotalRevenueProjection getRevenueAndOrderCount(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId
    );

    /**
     * Lấy hourly revenue breakdown (cho daily chart)
     */
    @Query(value = """
            SELECT
                report_hour AS reportHour,
                COALESCE(SUM(CAST(total_revenue AS BIGINT)), 0) AS totalRevenue,
                COALESCE(COUNT(DISTINCT order_id), 0) AS orderCount
            FROM view_revenue_analytics
            WHERE report_date = :date
              AND (:categoryId IS NULL OR category_id = :categoryId)
            GROUP BY report_hour
            ORDER BY report_hour
            """, nativeQuery = true)
    List<HourlyRevenueProjection> findHourlyRevenue(
            @Param("date") LocalDate date,
            @Param("categoryId") Long categoryId
    );

    /**
     * Lấy category revenue distribution
     */
    @Query(value = """
            SELECT
                category_id AS categoryId,
                category_name AS categoryName,
                COALESCE(SUM(total_quantity_sold), 0) AS totalQuantitySold,
                COALESCE(SUM(CAST(total_revenue AS BIGINT)), 0) AS totalRevenue
            FROM view_revenue_analytics
            WHERE report_date BETWEEN :startDate AND :endDate
            GROUP BY category_id, category_name
            ORDER BY totalRevenue DESC
            """, nativeQuery = true)
    List<CategoryRevenueProjection> findCategoryRevenue(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Lấy top products
     */
    @Query(value = """
            SELECT
                product_id AS productId,
                product_title AS productTitle,
                category_id AS categoryId,
                category_name AS categoryName,
                COALESCE(SUM(total_quantity_sold), 0) AS totalQuantitySold,
                COALESCE(SUM(CAST(total_revenue AS BIGINT)), 0) AS totalRevenue
            FROM view_revenue_analytics
            WHERE report_date BETWEEN :startDate AND :endDate
              AND (:categoryId IS NULL OR category_id = :categoryId)
            GROUP BY product_id, product_title, category_id, category_name
            ORDER BY
              CASE WHEN :sortBy = 'QUANTITY' THEN COALESCE(SUM(total_quantity_sold), 0) END DESC,
              CASE WHEN :sortBy = 'REVENUE' THEN COALESCE(SUM(CAST(total_revenue AS BIGINT)), 0) END DESC,
              product_id
            LIMIT :limit
            """, nativeQuery = true)
    List<TopProductProjection> findTopProducts(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId,
            @Param("sortBy") String sortBy,
            @Param("limit") int limit
    );

    /**
     * Lấy revenue by payment method
     */
    @Query(value = """
            SELECT
                payment_method AS paymentMethod,
                COALESCE(SUM(CAST(total_revenue AS BIGINT)), 0) AS totalRevenue,
                COALESCE(SUM(total_quantity_sold), 0) AS totalQuantitySold,
                COUNT(DISTINCT order_id) AS orderCount
            FROM view_revenue_analytics
            WHERE report_date BETWEEN :startDate AND :endDate
              AND (:categoryId IS NULL OR category_id = :categoryId)
            GROUP BY payment_method
            ORDER BY totalRevenue DESC
            """, nativeQuery = true)
    List<PaymentMethodRevenueProjection> findRevenueByPaymentMethod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId
    );

    /**
     * Lấy pending revenue + order count
     */
    @Query(value = """
            SELECT
                COALESCE(SUM(o.total_price), 0) AS pendingRevenue,
                COALESCE(COUNT(DISTINCT o.id), 0) AS pendingOrders
            FROM orders o
            LEFT JOIN order_detail od ON o.id = od.order_id
            LEFT JOIN product p ON od.product_id = p.id
            WHERE o.status IN ('PENDING', 'APPROVED', 'SHIPPING')
              AND CAST(o.created_at AS DATE) BETWEEN :startDate AND :endDate
              AND (:categoryId IS NULL OR p.category_id = :categoryId)
            """, nativeQuery = true)
    PendingRevenueStatsProjection getPendingRevenueAndOrderCount(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId
    );

    /**
     * Lấy cancelled revenue + cancelled count + total count
     */
    @Query(value = """
            SELECT
                COALESCE(SUM(CASE WHEN o.status = 'CANCELLED' THEN o.total_price ELSE 0 END), 0) AS cancelledRevenue,
                COALESCE(COUNT(DISTINCT CASE WHEN o.status = 'CANCELLED' THEN o.id END), 0) AS cancelledOrders,
                COALESCE(COUNT(DISTINCT o.id), 0) AS totalOrders
            FROM orders o
            LEFT JOIN order_detail od ON o.id = od.order_id
            LEFT JOIN product p ON od.product_id = p.id
            WHERE CAST(o.created_at AS DATE) BETWEEN :startDate AND :endDate
              AND (:categoryId IS NULL OR p.category_id = :categoryId)
            """, nativeQuery = true)
    CancelRateStatsProjection getCancelledAndTotalOrderStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categoryId") Long categoryId
    );
}

