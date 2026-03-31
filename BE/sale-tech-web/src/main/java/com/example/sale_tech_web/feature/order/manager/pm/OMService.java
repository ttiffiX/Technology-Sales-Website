package com.example.sale_tech_web.feature.order.manager.pm;

import com.example.sale_tech_web.feature.order.dto.StatusCountDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class OMService implements OMServiceInterface {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    public List<OrderDTO> getAllOrderByStatus(OrderStatus orderStatus) {
        return orderRepository.findByOptionalStatus(orderStatus).stream()
                .map(order -> {
                    String paymentStatus = order.getPayment() != null
                            ? order.getPayment().getStatus().name()
                            : "UNKNOWN";
                    return convertToDTO(order, paymentStatus);
                })
                .toList();
    }

    @Override
    @Transactional
    public String approveOrder(Long orderId) {
        Order order = findOrderById(orderId);
        validateTransition(order.getStatus(), OrderStatus.PENDING, "approve");

        order.setStatus(OrderStatus.APPROVED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return "Order #" + orderId + " approved successfully";
    }

    @Override
    @Transactional
    public String rejectOrder(Long orderId, String reason) {
        Order order = findOrderById(orderId);
        validateTransition(order.getStatus(), OrderStatus.PENDING, "reject");

        for (OrderDetail orderDetail : order.getOrderDetails()) {
            productRepository.incrementStockOnRevert(orderDetail.getProduct().getId(), orderDetail.getQuantity());
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setDescription(reason);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return "Order #" + orderId + " rejected. Reason: " + reason;
    }

    @Override
    @Transactional
    public String moveToShipping(Long orderId) {
        Order order = findOrderById(orderId);
        validateTransition(order.getStatus(), OrderStatus.APPROVED, "move to shipping");

        order.setStatus(OrderStatus.SHIPPING);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return "Order #" + orderId + " moved to SHIPPING";
    }

    @Override
    @Transactional
    public String completeOrder(Long orderId) {
        Order order = findOrderById(orderId);
        validateTransition(order.getStatus(), OrderStatus.SHIPPING, "complete");

        order.setStatus(OrderStatus.COMPLETED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return "Order #" + orderId + " marked as COMPLETED";
    }

    @Override
    public StatusCountDTO getOrderCountByStatus() {
        Map<OrderStatus, Integer> result = OrderStatus.initStatusCountMap();
        int allCount = 0;

        for (Object[] row : orderRepository.countAllGroupByStatus()) {
            OrderStatus status = (OrderStatus) row[0];
            Number count = (Number) row[1];
            result.put(status, count.intValue());
            allCount += count.intValue();
        }

        return StatusCountDTO.builder()
                .totalStatusCount(allCount)
                .orderStatusCountMap(result)
                .build();
    }

    private Order findOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));
    }

    private void validateTransition(OrderStatus currentStatus, OrderStatus expectedStatus, String action) {
        if (currentStatus != expectedStatus) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Cannot " + action + " order with status " + currentStatus + ". Required status: " + expectedStatus);
        }
    }

    private OrderDTO convertToDTO(Order order, String paymentStatus) {
        return OrderDTO.builder()
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
                .description(order.getDescription())
                .updatedAt(order.getUpdatedAt())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(paymentStatus)
                .build();
    }
}
