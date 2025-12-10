package com.example.sale_tech_web.feature.cart.manager;

import com.example.sale_tech_web.feature.cart.dto.CartDTO;

public interface CartServiceInterface {
    CartDTO getCartItems();
    String addProductToCart(Long productId);
    CartDTO changeProductQuantity(Long productId, int quantity);
    CartDTO removeProductFromCart(Long productId);
    CartDTO toggleProductSelection(Long productId);
    CartDTO toggleAllProducts(boolean selectAll);
}
