package com.example.sale_tech_web.feature.order.repository;

import com.example.sale_tech_web.feature.order.entity.orders.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

//    @EntityGraph(attributePaths = {"orderDetails"})
//    @Query("SELECT o FROM Order o" +
//            "LEFT JOIN FETCH o.orderDetails od" +
//            "WHERE o.user.id = :userId" +
//            "ORDER BY o.createdAt DESC")
//    List<Order> findByUserIdWithDetails(@Param("userId") Long userId);
}

