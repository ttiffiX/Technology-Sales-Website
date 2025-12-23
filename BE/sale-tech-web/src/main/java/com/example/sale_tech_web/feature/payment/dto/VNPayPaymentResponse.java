package com.example.sale_tech_web.feature.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VNPayPaymentResponse {
    private String paymentUrl;
    private String txnRef;
    private Long orderId;
}

