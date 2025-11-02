package com.example.sale_tech_web.feature.order.manager;

import com.example.sale_tech_web.controller.exception.ClientException;
import com.example.sale_tech_web.feature.cart.entity.CartResponse;
import com.example.sale_tech_web.feature.cart.manager.CartService;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.OrderResponse;
import com.example.sale_tech_web.feature.order.repository.OrderDetailRepository;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.payment.manager.PaymentService;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.manager.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final PaymentService paymentService;

    public OrderResponse getAllOrders() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Order.desc("updateAt")));
        List<OrderDetail> orderDetails = orderDetailRepository.findAll();
        List<OrderDetailDTO> orderDetailDTOS = orderDetails.stream().map(item -> {
            Product product = productService.getProductById(item.getProductId());

            OrderDetailDTO orderDetailDTO = new OrderDetailDTO();
            orderDetailDTO.setOrderDetailId(item.getOrderdetailId());
            orderDetailDTO.setOrderId(item.getOrderId());
            orderDetailDTO.setName(product.getName());
            orderDetailDTO.setPrice(product.getPrice());
            orderDetailDTO.setQuantity(item.getQuantity());
            orderDetailDTO.setImage(product.getImage());

            return orderDetailDTO;
        }).collect(Collectors.toList());
        return new OrderResponse(orders, orderDetailDTOS);
    }

    public String placeOrder(String name, String phone, String address, String payment_method) {
        CartResponse cartResponse = cartService.getCartItems();

        int totalPrice = cartResponse.getCartDTO().stream()
                .mapToInt(cart -> cart.getPrice() * cart.getQuantity())
                .sum();

        // Tạo Order mới
        Order newOrder = Order.builder()
                .customerId(1L)
                .totalPrice(totalPrice)
                .orderDate(LocalDateTime.now())
                .status("pending")
                .name(name)
                .phone(phone)
                .address(address)
                .build();

        // Lưu Order vào CSDL
        Order savedOrder = orderRepository.save(newOrder);

        // Lưu từng sản phẩm trong giỏ hàng vào OrderDetail
        List<OrderDetail> orderDetails = cartResponse.getCartDTO().stream()
                .map(cart -> OrderDetail.builder()
                        .orderId(savedOrder.getOrderId())
                        .productId(cart.getProductId())
                        .quantity(cart.getQuantity())
                        .unitPrice(cart.getPrice())
                        .build()).collect(Collectors.toList());

        // Lưu danh sách OrderDetail
        orderDetailRepository.saveAll(orderDetails);

        paymentService.setPayment(savedOrder.getOrderId(), payment_method);

        // Xóa tất cả các sản phẩm trong giỏ hàng
        cartService.removeAllFromCart();

        return "Place order successfully!";
    }

    public String cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ClientException("Order not found."));
        order.setStatus("canceled");
        paymentService.cancelPayment(order.getOrderId());
        orderRepository.save(order);
        return "Canceled successfully!";
    }
}

