package com.example.sale_tech_web.feature.order.manager.pm;

import com.example.sale_tech_web.feature.order.dto.StatusCountDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundRequest;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundResponse;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import com.example.sale_tech_web.feature.payment.service.VNPayService;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class OMService implements OMServiceInterface {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final VNPayService vnPayService;

    @Override
    public Page<OrderDTO> getAllOrderByStatus(String orderStatus,
                                              String paymentStatus,
                                              String keyword,
                                              LocalDateTime startDate,
                                              LocalDateTime endDate,
                                              Pageable pageable) {
        OrderStatus oStatus = null;
        if (orderStatus != null && !orderStatus.isBlank()) {
            oStatus = OrderStatus.valueOf(orderStatus.trim().toUpperCase());
        }

        PaymentStatus pStatus = null;
        if (paymentStatus != null && !paymentStatus.isBlank()) {
            pStatus = PaymentStatus.valueOf(paymentStatus.trim().toUpperCase());
        }

        Page<Order> orderPage = orderRepository.findAllOrderCustom(
                oStatus, pStatus, keyword, startDate, endDate, pageable);

        return orderPage.map(order -> {
            String status = (order.getPayment() != null)
                    ? order.getPayment().getStatus().name() : "UNKNOWN";
            return convertToDTO(order, status);
        });
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailsByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));

        List<OrderDetail> orderDetails = order.getOrderDetails();

        List<OrderDetailDTO> orderDetailDTOs = new ArrayList<>();
        for (OrderDetail detail : orderDetails) {
            OrderDetailDTO dto = OrderDetailDTO.builder()
                    .id(detail.getId())
                    .productTitle(detail.getProductTitle())
                    .categoryName(detail.getCategoryName())
                    .quantity(detail.getQuantity())
                    .price(detail.getPrice())
                    .build();
            orderDetailDTOs.add(dto);
        }

        return orderDetailDTOs;
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
    public String rejectOrder(Long orderId, String reason, HttpServletRequest request) {
        Order order = findOrderById(orderId);
        validateTransition(order.getStatus(), OrderStatus.PENDING, "reject");

        // Check if payment exists for this order
        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        String refundMessage = "";

        // If payment exists and was successful with VNPay, process refund
        if (payment != null && payment.getStatus() == PaymentStatus.PAID
                && payment.getProvider() == PaymentMethod.VNPAY) {

            try {
                // Prepare refund request
                VNPayRefundRequest refundRequest = VNPayRefundRequest.builder()
                        .txnRef(payment.getTransactionId())
                        .amount(Long.valueOf(payment.getAmount()))
                        .transactionType("02") // "02" = Full refund, "03" = Partial refund
                        .transactionDate(payment.getVnpPayDate())
                        .transactionNo(payment.getVnpTransactionNo()) // VNPay transaction number if available
                        .createBy(order.getUser().getUsername())
                        .orderInfo("Hoan tien don hang " + orderId)
                        .build();

                // Call VNPay refund API
                VNPayRefundResponse refundResponse = vnPayService.processRefund(refundRequest, request);

                // Check refund response
                if ("00".equals(refundResponse.getResponseCode())) {
                    // Refund successful
                    payment.setStatus(PaymentStatus.REFUND);
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    refundMessage = " and payment has been refunded successfully";
                } else {
                    // Refund failed
                    refundMessage = " but refund failed: " + refundResponse.getMessage();

                    // Still cancel the order but mark payment status accordingly
                    payment.setStatus(PaymentStatus.REFUND_FAILED);
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                }

            } catch (Exception e) {
                refundMessage = " but refund encountered an error: " + e.getMessage();

                // Mark payment as refund failed
                payment.setStatus(PaymentStatus.REFUND_FAILED);
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
            }
        } else if (payment != null && payment.getStatus() == PaymentStatus.PENDING) {
            // If payment is still pending, just mark it as rejected
            payment.setStatus(PaymentStatus.FAILED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            refundMessage = " and pending payment has been rejected";
        }

        for (OrderDetail orderDetail : order.getOrderDetails()) {
            productRepository.incrementStockOnRevert(orderDetail.getProduct().getId(), orderDetail.getQuantity());
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setDescription(reason);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return "Order #" + orderId + " rejected. Reason rejected: See description for details.";
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

        Payment payment = order.getPayment();

        if (payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.PAID);
        }

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
