package com.example.sale_tech_web.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlaceOrderRequest {
    private String customerName;
    private String phone;
    private String email;
    private String address;
    private String province;
    private String description;
    private String paymentMethod;
}
