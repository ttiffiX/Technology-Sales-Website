package com.example.sale_tech_web.feature.order.repository;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"payment"})
    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.payment " +
            "WHERE o.user.id = :userId " +
            "AND (:status IS NULL OR o.status = :status) " +
            "ORDER BY o.createdAt DESC")
    List<Order> findByUserIdAndOptionalStatus(@Param("userId") Long userId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderDetails LEFT JOIN FETCH o.user WHERE o.id = :orderId AND o.user.id = :userId")
    Optional<Order> findByIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);
}

