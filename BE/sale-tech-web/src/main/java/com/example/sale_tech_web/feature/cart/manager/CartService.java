package com.example.sale_tech_web.feature.cart.manager;

import com.example.sale_tech_web.feature.cart.entity.Cart;
import com.example.sale_tech_web.feature.cart.dto.CartDetailDTO;
import com.example.sale_tech_web.feature.cart.entity.CartDetail;
import com.example.sale_tech_web.feature.cart.dto.CartDTO;
import com.example.sale_tech_web.feature.cart.repository.CartDetailRepository;
import com.example.sale_tech_web.feature.cart.repository.CartRepository;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.product.dto.ProductListDTO;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService implements CartServiceInterface {
    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartDTO getCartItems() {
        // 1. Lấy userId từ JWT token
        Long userId = getUserIdFromToken();

        // 2. Lấy Cart với tất cả relationships trong 1 query (JOIN FETCH)
        // Không cần query User riêng, không cần query CartDetails riêng, không cần query Products riêng
        Cart cart = cartRepository.findByUserIdWithDetails(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Cart not found"));

        // 3. Lấy CartDetails từ relationship (đã được load bởi JOIN FETCH)
        List<CartDetail> cartItems = cart.getCartDetailList();

        // 4. Nếu giỏ hàng trống
        if (cartItems.isEmpty()) {
            return CartDTO.builder()
                    .cartId(cart.getId())
                    .totalQuantity(0)
                    .totalPrice(0)
                    .cartDetailDTO(List.of())
                    .build();
        }


        // 6. Tính tổng số lượng và giá cho các sản phẩm ĐƯỢC CHỌN
        int totalQuantity = cartItems.stream()
                .filter(item -> item.getIsSelected() != null && item.getIsSelected())
                .mapToInt(CartDetail::getQuantity)
                .sum();

        int totalPrice = cartItems.stream()
                .filter(item -> item.getIsSelected() != null && item.getIsSelected())
                .mapToInt(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        // 7. Map to DTOs (không có query trong loop vì đã JOIN FETCH)
        List<CartDetailDTO> cartDetailDTOS = cartItems.stream()
                .map(cartDetail -> {
                    Product product = cartDetail.getProduct(); // Đã được load

                    ProductListDTO productDTO = ProductListDTO.builder()
                            .id(product.getId())
                            .title(product.getTitle())
                            .price(product.getPrice())
                            .quantitySold(product.getQuantitySold() != null ? product.getQuantitySold() : 0)
                            .imageUrl(product.getImageUrl())
                            .stocked(product.getStocked())
                            .categoryName(product.getCategory().getName()) // Category cũng đã được load
                            .build();

                    return CartDetailDTO.builder()
                            .cartDetailId(cartDetail.getId())
                            .productList(productDTO)
                            .quantity(cartDetail.getQuantity())
                            .isSelected(cartDetail.getIsSelected() != null ? cartDetail.getIsSelected() : true)
                            .build();
                })
                .collect(Collectors.toList());

        // 8. Return DTO với totalPrice và selectedPrice được tính động
        return CartDTO.builder()
                .cartId(cart.getId())
                .totalQuantity(totalQuantity)
                .totalPrice(totalPrice)
                .cartDetailDTO(cartDetailDTOS)
                .build();
    }

    @Override
    @Transactional
    public String addProductToCart(Long productId) {
        // 1. Get current user from JWT
        Long userId = getUserIdFromToken();

        // 2. Validate product exists and is in stock
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        // Check if product is active
        if (product.getIsActive() != null && !product.getIsActive()) {
            throw new ResponseStatusException(CONFLICT, "Product is no longer available");
        }

        if (!product.getStocked()) {
            throw new ResponseStatusException(CONFLICT, "Product is out of stock");
        }

        // 3. Get or create cart for user
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Users user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

                    Cart newCart = Cart.builder()
                            .user(user)
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return cartRepository.save(newCart);
                });

        // 4. Check if product already exists in cart
        CartDetail existingCartDetail = cartDetailRepository
                .findByCartIdAndProductId(cart.getId(), productId).orElse(null);

        if (existingCartDetail != null) {
            throw new ResponseStatusException(CONFLICT, "Product already exists in cart. Use change quantity instead.");
        }

        // 5. Add new product to cart
        CartDetail cartDetail = CartDetail.builder()
                .cart(cart)
                .product(product)
                .quantity(1)
                .addedAt(LocalDateTime.now())
                .build();

        cartDetailRepository.save(cartDetail);

        // 6. Update cart timestamp
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return "Product added to cart successfully";
    }

    @Override
    @Transactional
    public CartDTO changeProductQuantity(Long productId, int quantity) {
        // 1. Validate quantity
        if (quantity <= 0) {
            throw new ResponseStatusException(CONFLICT, "Quantity must be greater than 0. Use remove function to delete item.");
        }

        if (quantity > 10) {
            throw new ResponseStatusException(CONFLICT, "Maximum quantity per product is 10");
        }

        // 2. Get current user from JWT
        Long userId = getUserIdFromToken();

        // 3. Get user's cart
        Cart cart = getUserCart(userId);

        // 4. Find cart detail for this product
        CartDetail cartDetail = getCartDetail(cart.getId(), productId);

        // 5. Check product availability and stock
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

        // Check if product is active
        if (product.getIsActive() != null && !product.getIsActive()) {
            throw new ResponseStatusException(CONFLICT, "Product is no longer available");
        }

        // Check if requested quantity is available in inventory
        if (product.getQuantity() == null || product.getQuantity() < quantity) {
            throw new ResponseStatusException(CONFLICT, "Insufficient stock. Available quantity: " +
                    (product.getQuantity() != null ? product.getQuantity() : 0));
        }

        // 6. Update quantity
        cartDetail.setQuantity(quantity);
        cartDetailRepository.save(cartDetail);

        // 7. Update cart timestamp
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        // 8. Return updated cart
        return getCartItems();
    }

    @Override
    @Transactional
    public CartDTO removeProductFromCart(Long productId) {
        // 1. Get current user from JWT
        Long userId = getUserIdFromToken();

        // 2. Get user's cart
        Cart cart = getUserCart(userId);

        // 3. Find cart detail for this product
        CartDetail cartDetail = getCartDetail(cart.getId(), productId);

        // 4. Remove product from cart
        // Note: We keep the cart even if it becomes empty (better UX)
        // The cart will be reused when user adds new products
        cartDetailRepository.delete(cartDetail);

        // 5. Update cart timestamp
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        // 6. Return updated cart
        return getCartItems();
    }

    @Override
    @Transactional
    public CartDTO toggleProductSelection(Long productId) {
        // 1. Get current user from JWT
        Long userId = getUserIdFromToken();

        // 2. Get user's cart
        Cart cart = getUserCart(userId);

        // 3. Find cart detail for this product
        CartDetail cartDetail = getCartDetail(cart.getId(), productId);

        // 4. Toggle selection status
        Boolean currentStatus = cartDetail.getIsSelected();
        cartDetail.setIsSelected(currentStatus == null || !currentStatus);
        cartDetailRepository.save(cartDetail);

        cartRepository.save(cart);

        // 5. Return updated cart
        return getCartItems();
    }

    @Override
    @Transactional
    public CartDTO toggleAllProducts(boolean selectAll) {
        // 1. Get current user from JWT
        Long userId = getUserIdFromToken();

        // 2. Get user's cart
        Cart cart = getUserCart(userId);

        // 3. Get all cart details
        List<CartDetail> cartDetails = cartDetailRepository.findByCartId(cart.getId());

        // 4. Update all cart details
        cartDetails.forEach(cartDetail -> cartDetail.setIsSelected(selectAll));
        cartDetailRepository.saveAll(cartDetails);

        cartRepository.save(cart);

        // 5. Return updated cart
        return getCartItems();
    }

    // -- Helper methods -- //

    private Long getUserIdFromToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }
        return userId;
    }

    private Cart getUserCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Cart not found"));
    }

    private CartDetail getCartDetail(Long cartId, Long productId) {
        return cartDetailRepository
                .findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found in cart"));
    }

}
