package com.example.sale_tech_web.feature.revenue.repository;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.revenue.entity.CategoryRevenueProjection;
import com.example.sale_tech_web.feature.revenue.entity.HourlyRevenueProjection;
import com.example.sale_tech_web.feature.revenue.entity.PaymentMethodRevenueProjection;
import com.example.sale_tech_web.feature.revenue.entity.TopProductProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RevenueRepository extends JpaRepository<Order, Long> {

    @Query(value = """
            SELECT COALESCE(SUM(total_revenue), 0)
            FROM view_daily_revenue_summary
            WHERE report_date BETWEEN :startDate AND :endDate
              AND order_status = 'COMPLETED'
              AND payment_status = 'PAID'
            """, nativeQuery = true)
    Long sumCompletedPaidRevenue(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT COALESCE(SUM(total_orders), 0)
            FROM view_daily_revenue_summary
            WHERE report_date BETWEEN :startDate AND :endDate
              AND order_status = 'COMPLETED'
              AND payment_status = 'PAID'
            """, nativeQuery = true)
    Long countCompletedPaidOrders(@Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT COALESCE(SUM(total_revenue), 0)
            FROM view_daily_revenue_summary
            WHERE order_status IN ('PENDING', 'APPROVED', 'SHIPPING')
            """, nativeQuery = true)
    Long sumPendingRevenue();

    @Query(value = """
            SELECT COALESCE(SUM(total_orders), 0)
            FROM view_daily_revenue_summary
            WHERE order_status IN ('PENDING', 'APPROVED', 'SHIPPING')
            """, nativeQuery = true)
    Long countPendingOrders();

    @Query(value = """
            SELECT COALESCE(SUM(total_revenue), 0)
            FROM view_daily_revenue_summary
            WHERE report_date BETWEEN :startDate AND :endDate
              AND order_status = 'CANCELLED'
            """, nativeQuery = true)
    Long sumCancelledRevenue(@Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT COALESCE(SUM(total_orders), 0)
            FROM view_daily_revenue_summary
            WHERE report_date BETWEEN :startDate AND :endDate
              AND order_status = 'CANCELLED'
            """, nativeQuery = true)
    Long countCancelledOrders(@Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT COALESCE(SUM(total_orders), 0)
            FROM view_daily_revenue_summary
            WHERE report_date BETWEEN :startDate AND :endDate
            """, nativeQuery = true)
    Long countTotalOrders(@Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT
                report_hour AS hour,
                COALESCE(SUM(total_revenue), 0) AS revenue,
                COALESCE(SUM(total_orders), 0) AS orderCount
            FROM view_daily_revenue_summary
            WHERE report_date = :date
              AND order_status = 'COMPLETED'
              AND payment_status = 'PAID'
            GROUP BY report_hour
            ORDER BY report_hour
            """, nativeQuery = true)
    List<HourlyRevenueProjection> findHourlyRevenue(@Param("date") LocalDate date);

    @Query(value = """
            SELECT
                category_id AS categoryId,
                category_name AS categoryName,
                COALESCE(SUM(total_quantity_sold), 0) AS totalQuantitySold,
                COALESCE(SUM(total_revenue), 0) AS totalRevenue
            FROM view_product_performance
            WHERE report_date BETWEEN :startDate AND :endDate
            GROUP BY category_id, category_name
            ORDER BY totalRevenue DESC
            """, nativeQuery = true)
    List<CategoryRevenueProjection> findCategoryRevenue(@Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT
                product_id AS productId,
                product_title AS productTitle,
                category_id AS categoryId,
                category_name AS categoryName,
                COALESCE(SUM(total_quantity_sold), 0) AS totalQuantitySold,
                COALESCE(SUM(total_revenue), 0) AS totalRevenue
            FROM view_product_performance
            WHERE report_date BETWEEN :startDate AND :endDate
              AND (:categoryId IS NULL OR category_id = :categoryId)
            GROUP BY product_id, product_title, category_id, category_name
            ORDER BY
              CASE WHEN :sortBy = 'QUANTITY' THEN COALESCE(SUM(total_quantity_sold), 0) END DESC,
              CASE WHEN :sortBy = 'REVENUE' THEN COALESCE(SUM(total_revenue), 0) END DESC,
              product_id
            LIMIT :limit
            """, nativeQuery = true)
    List<TopProductProjection> findTopProducts(@Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate,
                                               @Param("categoryId") Long categoryId,
                                               @Param("sortBy") String sortBy,
                                               @Param("limit") int limit);

    @Query(value = """
            SELECT
                payment_method AS paymentMethod,
                COALESCE(SUM(total_revenue), 0) AS totalRevenue,
                COALESCE(SUM(total_quantity_sold), 0) AS totalQuantitySold,
                COUNT(DISTINCT order_id) AS orderCount
            FROM view_product_performance
            WHERE report_date BETWEEN :startDate AND :endDate
              AND (:categoryId IS NULL OR category_id = :categoryId)
            GROUP BY payment_method
            ORDER BY totalRevenue DESC
            """, nativeQuery = true)
    List<PaymentMethodRevenueProjection> findRevenueByPaymentMethod(@Param("startDate") LocalDate startDate,
                                                                    @Param("endDate") LocalDate endDate,
                                                                    @Param("categoryId") Long categoryId);
}

