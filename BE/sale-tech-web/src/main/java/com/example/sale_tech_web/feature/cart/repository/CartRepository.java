package com.example.sale_tech_web.feature.cart.repository;

import com.example.sale_tech_web.feature.cart.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    @EntityGraph(attributePaths = {
            "cartDetailList"
    })
    Optional<Cart> findWithCartDetailListByUserId(@Param("userId") Long userId);

    @EntityGraph(attributePaths = {
            "cartDetailList",
            "cartDetailList.product",
            "cartDetailList.product.category"
    })
    Optional<Cart> findByUserId(Long userId);
}