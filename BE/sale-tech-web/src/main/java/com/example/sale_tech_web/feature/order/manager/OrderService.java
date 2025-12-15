package com.example.sale_tech_web.feature.order.manager;

import static org.springframework.http.HttpStatus.*;

import com.example.sale_tech_web.feature.cart.entity.CartDetail;
import com.example.sale_tech_web.feature.cart.repository.CartDetailRepository;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.order.dto.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.PlaceOrderRequest;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.enums.PaymentMethod;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService implements OrderServiceInterface {
    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;
    private final UserRepository userRepository;

    @Override
    public List<OrderDTO> getOrderByUserId() {
        Long userId = getUserIdFromToken();

        List<Order> orders = orderRepository.findByUserId(userId);

        List<OrderDTO> orderDTOs = new ArrayList<>();
        for (Order order : orders) {
            OrderDTO orderDTO = OrderDTO.builder()
                    .id(order.getId())
                    .customerName(order.getCustomerName())
                    .phone(order.getPhone())
                    .email(order.getEmail())
                    .address(order.getAddress())
                    .province(order.getProvince())
                    .deliveryFee(order.getDeliveryFee())
                    .totalPrice(order.getTotalPrice())
                    .createdAt(order.getCreatedAt())
                    .status(order.getStatus().name())
                    .build();

            orderDTOs.add(orderDTO);
        }
        return orderDTOs;
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailsByUserId() {
        return List.of();
    }

    @Override
    @Transactional
    public String placeOrder(PlaceOrderRequest request) {
        Long userId = getUserIdFromToken();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        List<CartDetail> cartDetails = cartDetailRepository.findSelectedByUserId(userId);

        if (cartDetails.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Need at least one items selected. ");
        }

        Order order = Order.builder()
                .user(user)
                .customerName(request.getCustomerName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .province(request.getProvince())
                .deliveryFee(30000)
                .status(OrderStatus.PENDING)
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .paymentMethod(PaymentMethod.CASH)
                .orderDetails(new ArrayList<>())
                .build();

        int tempTotalPrice = 0;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (CartDetail cartDetail : cartDetails) {
            Product product = cartDetail.getProduct();

            if (!product.getIsActive()) {
                throw new ResponseStatusException(CONFLICT, "Product is no longer available");
            }

            if (product.getQuantity() == null || product.getQuantity() < cartDetail.getQuantity()) {
                throw new ResponseStatusException(CONFLICT, "Insufficient stock. Available quantity: " +
                        (product.getQuantity() != null ? product.getQuantity() : 0));
            }

            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(cartDetail.getProduct())
                    .quantity(cartDetail.getQuantity())
                    .price(cartDetail.getProduct().getPrice())
                    .productTitle(cartDetail.getProduct().getTitle())
                    .categoryName(cartDetail.getProduct().getCategory().getName())
                    .build();

            orderDetails.add(orderDetail);
            tempTotalPrice += cartDetail.getProduct().getPrice() * cartDetail.getQuantity();
        }
        order.setOrderDetails(orderDetails);
        order.setTotalPrice(tempTotalPrice + order.getDeliveryFee());
        orderRepository.save(order);
        cartDetailRepository.deleteAll(cartDetails);

        return "Order placed successfully for user: " + user.getUsername();
    }

    @Override
    public String cancelOrder(Long orderId) {
        return "";
    }

    @Override
    public List<OrderDTO> getOrdersByStatus(String status) {
        return List.of();
    }

    // -- Helper Method -- //
    private Long getUserIdFromToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }
        return userId;
    }
}

