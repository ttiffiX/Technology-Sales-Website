package com.example.sale_tech_web.feature.order.manager.pm;

import com.example.sale_tech_web.feature.order.dto.StatusCountDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDTO;
import com.example.sale_tech_web.feature.order.dto.customer.OrderDetailDTO;

import java.util.List;

public interface OMServiceInterface {

    List<OrderDTO> getAllOrderByStatus(String orderStatus);

    List<OrderDetailDTO> getOrderDetailsByOrderId(Long orderId);

    String approveOrder(Long orderId);

    String rejectOrder(Long orderId, String reason);

    String moveToShipping(Long orderId);

    String completeOrder(Long orderId);

    StatusCountDTO getOrderCountByStatus();
}
