package com.example.sale_tech_web.feature.order.manager.customer;

import com.example.sale_tech_web.exception.BadRequestException;
import com.example.sale_tech_web.exception.ConflictException;
import com.example.sale_tech_web.exception.ForbiddenException;
import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.exception.UnauthorizedException;
import com.example.sale_tech_web.feature.cart.entity.CartDetail;
import com.example.sale_tech_web.feature.cart.repository.CartDetailRepository;
import com.example.sale_tech_web.feature.jwt.SecurityUtils;
import com.example.sale_tech_web.feature.order.dto.StatusCountDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;
import com.example.sale_tech_web.feature.order.dto.customer.PlaceOrderRequest;
import com.example.sale_tech_web.feature.order.entity.orderdetails.OrderDetail;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.order.enums.OrderStatus;
import com.example.sale_tech_web.feature.order.repository.OrderRepository;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundRequest;
import com.example.sale_tech_web.feature.payment.dto.VNPayRefundResponse;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.manager.PaymentServiceInterface;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import com.example.sale_tech_web.feature.payment.service.VNPayService;
import com.example.sale_tech_web.feature.product.entity.Product;
import com.example.sale_tech_web.feature.product.repository.ProductRepository;
import com.example.sale_tech_web.feature.users.entity.Users;
import com.example.sale_tech_web.feature.users.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;


@Service
@RequiredArgsConstructor
public class OrderService implements OrderServiceInterface {
    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;
    private final UserRepository userRepository;
    private final VNPayService vnPayService;
    private final PaymentServiceInterface paymentServiceInterface;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;

    @Override
    public Page<OrderDTO> getOrderByUserId(String orderStatus,
                                           String paymentStatus,
                                           LocalDateTime startDate,
                                           LocalDateTime endDate,
                                           Pageable pageable) {
        Long userId = getUserIdFromToken();

        OrderStatus oStatus = null;
        if (orderStatus != null && !orderStatus.trim().isEmpty()) {
            oStatus = OrderStatus.valueOf(orderStatus.trim().toUpperCase());
        }

        PaymentStatus pStatus = null;
        if (paymentStatus != null && !paymentStatus.trim().isEmpty()) {
            pStatus = PaymentStatus.valueOf(paymentStatus.trim().toUpperCase());
        }

        Page<Order> orderPage = orderRepository.findAllUserOrderCustom(
                userId, oStatus, pStatus, startDate, endDate, pageable);

        return orderPage.map(order -> {
            String currentPaymentStatus = order.getPayment() != null
                    ? order.getPayment().getStatus().name()
                    : "UNKNOWN";
            return convertToDTO(order, currentPaymentStatus);
        });
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailsByOrderId(Long orderId) {
        Long userId = getUserIdFromToken();

        // Verify that the order belongs to the current user
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException(
                        "Order not found or you don't have permission to view this order"));

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
    public Object placeOrder(PlaceOrderRequest request, HttpServletRequest httpRequest) {
        Long userId = getUserIdFromToken();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.isBanned()) {
            throw new ForbiddenException("Your account has been banned.");
        }

        List<CartDetail> cartDetails = cartDetailRepository.findSelectedByUserId(userId);

        if (cartDetails.isEmpty()) {
            throw new BadRequestException("Need at least one items selected. ");
        }

        // Apply stock updates in deterministic order to reduce deadlock probability.
        cartDetails.sort(Comparator.comparing(cd -> cd.getProduct().getId()));

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
                .paymentMethod(request.getPaymentMethod())
                .orderDetails(new ArrayList<>())
                .build();

        int tempTotalPrice = 0;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (CartDetail cartDetail : cartDetails) {
            Product product = cartDetail.getProduct();

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new ConflictException("Product is no longer available");
            }

            int updatedRows = productRepository.decrementStockIfAvailable(product.getId(), cartDetail.getQuantity());
            if (updatedRows == 0) {
                throw new ConflictException(
                        "Insufficient stock for product: " + product.getTitle());
            }

            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartDetail.getQuantity())
                    .price(product.getPrice())
                    .productTitle(product.getTitle())
                    .categoryName(product.getCategory().getName())
                    .build();

            orderDetails.add(orderDetail);
            tempTotalPrice += product.getPrice() * cartDetail.getQuantity();
        }

        order.setOrderDetails(orderDetails);
        order.setTotalPrice(tempTotalPrice + order.getDeliveryFee());
        Order savedOrder = orderRepository.save(order);

        // Check payment method
        if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            // Create VNPay payment URL
            String orderInfo = "Thanh toan don hang " + savedOrder.getId();

            // Create VNPay payment record with PENDING status
            var vnpayResponse = vnPayService.createPayment(
                    savedOrder.getId(),
                    savedOrder.getTotalPrice(),
                    orderInfo,
                    httpRequest
            );

            // Create Payment entity with txnRef
            Map<String, Object> params = new HashMap<>();
            params.put("txnRef", vnpayResponse.getTxnRef());
            paymentServiceInterface.createPayment(savedOrder, PaymentMethod.VNPAY, params);

            // Don't delete cart yet - will delete after successful payment
            return vnpayResponse;
        }

        // For CASH payment - delete cart immediately
        paymentServiceInterface.createPayment(order, PaymentMethod.CASH, null);
        cartDetailRepository.deleteAll(cartDetails);

        return "Order placed successfully for user: " + user.getUsername();
    }

    @Override
    @Transactional
    public String cancelOrder(Long orderId, HttpServletRequest request) {
        Long userId = getUserIdFromToken();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.isBanned()) {
            throw new ForbiddenException("Your account has been banned.");
        }

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException(
                        "Order not found or you don't have permission to cancel this order"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only orders with PENDING status can be cancelled. Current status: " + order.getStatus());
        }

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
            // If payment is still pending, just mark it as cancelled
            payment.setStatus(PaymentStatus.FAILED);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            refundMessage = " and pending payment has been cancelled";
        }

        // Revert product quantities atomically
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            productRepository.incrementStockOnRevert(orderDetail.getProduct().getId(), orderDetail.getQuantity());
        }

        // Cancel the order
        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return "Order #" + orderId + " has been cancelled successfully" + refundMessage;
    }

    @Override
    public StatusCountDTO getOrderCountByStatus() {
        Long userId = getUserIdFromToken();
        Map<OrderStatus, Integer> result = OrderStatus.initStatusCountMap();
        int allCount = 0;

        for (Object[] row : orderRepository.countByUserIdGroupByStatus(userId)) {
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


    // -- Helper Method -- //
    private Long getUserIdFromToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userId;
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

