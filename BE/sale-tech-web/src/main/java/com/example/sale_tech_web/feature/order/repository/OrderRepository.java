package com.example.sale_tech_web.feature.order.repository;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<List<Order>> findByUserId(Long userId);

    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.orderDetails od " +
            "LEFT JOIN FETCH od.product p " +
            "LEFT JOIN FETCH p.category " +
            "WHERE o.user.id = :userId")
    Optional<Order> findByUserIdWithDetails(@Param("userId") Long userId);
}

