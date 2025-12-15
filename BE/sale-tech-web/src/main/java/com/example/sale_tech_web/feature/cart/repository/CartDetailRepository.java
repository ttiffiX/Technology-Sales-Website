package com.example.sale_tech_web.feature.cart.repository;

import com.example.sale_tech_web.feature.cart.entity.CartDetail;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetail, Long> {
    List<CartDetail> findByCartId(Long cartId);

    Optional<CartDetail> findByCartIdAndProductId(Long cartId, Long productId);

    @EntityGraph(attributePaths = {
            "cart",
            "product",
            "product.category",
    })
    @Query("SELECT cd FROM CartDetail cd " +
            "JOIN cd.cart c " +
            "WHERE c.user.id = :userId AND cd.isSelected = true")
    List<CartDetail> findSelectedByUserId(Long userId);
}
