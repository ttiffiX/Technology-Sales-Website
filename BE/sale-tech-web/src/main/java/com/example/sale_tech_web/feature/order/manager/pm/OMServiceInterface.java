package com.example.sale_tech_web.feature.order.manager.pm;

import com.example.sale_tech_web.feature.order.dto.StatusCountDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface OMServiceInterface {

    Page<OrderDTO> getAllOrderByStatus(String orderStatus,
                                       String paymentStatus,
                                       String keyword,
                                       LocalDateTime startDate,
                                       LocalDateTime endDate,
                                       Pageable pageable);

    List<OrderDetailDTO> getOrderDetailsByOrderId(Long orderId);

    String approveOrder(Long orderId);

    String rejectOrder(Long orderId, String reason, HttpServletRequest request);

    String moveToShipping(Long orderId);

    String completeOrder(Long orderId);

    StatusCountDTO getOrderCountByStatus();
}
