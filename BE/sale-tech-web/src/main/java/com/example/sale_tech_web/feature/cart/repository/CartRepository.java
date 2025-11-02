package com.example.sale_tech_web.feature.cart.repository;

import com.example.sale_tech_web.feature.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Cart findByProductId(Long productId);
}
