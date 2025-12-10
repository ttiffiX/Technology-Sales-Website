package com.example.sale_tech_web.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String customerName;
    private String phone;
    private String email;
    private String address;
    private String province;
    private Integer deliveryFee;
    private Integer totalPrice;
    private LocalDate createdAt;
    private String status;
    private List<OrderDetailDTO> orderDetails;
}

