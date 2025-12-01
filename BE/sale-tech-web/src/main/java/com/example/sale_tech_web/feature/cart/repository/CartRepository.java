package com.example.sale_tech_web.feature.cart.repository;

import com.example.sale_tech_web.feature.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);

    // Tối ưu: Load Cart + CartDetails + Products + Categories trong 1 query
    @Query("SELECT c FROM Cart c " +
            "LEFT JOIN FETCH c.cartDetailList cd " +
            "LEFT JOIN FETCH cd.product p " +
            "LEFT JOIN FETCH p.category " +
            "WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithDetails(@Param("userId") Long userId);
}
