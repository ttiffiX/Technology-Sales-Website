package com.example.sale_tech_web.feature.order.repository;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"payment"})
    @Query("SELECT o FROM Order o " +
            "LEFT JOIN o.user u " +
            "LEFT JOIN o.payment p " +
            "WHERE (:orderStatus IS NULL OR o.status = :orderStatus) " +
            "AND (:paymentStatus IS NULL OR p.status = :paymentStatus) " +
            "AND (:keyword IS NULL OR " +
            "     LOWER(u.username) LIKE LOWER(CONCAT('%', CAST(:keyword as string), '%')) OR " +
            "     LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:keyword as string), '%')) OR " +
            "     u.phone LIKE CONCAT('%', CAST(:keyword as string), '%')) " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR o.createdAt >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR o.createdAt <= :endDate)")
    Page<Order> findAllOrderCustom(
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"payment"})
    @Query("SELECT o FROM Order o " +
            "LEFT JOIN o.payment p " +
            "WHERE o.user.id = :userId " +
            "AND (:orderStatus IS NULL OR o.status = :orderStatus) " +
            "AND (:paymentStatus IS NULL OR p.status = :paymentStatus) " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR o.createdAt >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR o.createdAt <= :endDate)")
    Page<Order> findAllUserOrderCustom(
            @Param("userId") Long userId,
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderDetails LEFT JOIN FETCH o.user WHERE o.id = :orderId AND o.user.id = :userId")
    Optional<Order> findByIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.user.id = :userId GROUP BY o.status")
    List<Object[]> countByUserIdGroupByStatus(@Param("userId") Long userId);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countAllGroupByStatus();
}

