package com.example.sale_tech_web.feature.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayRefundResponse {
    private String responseCode;        // Mã phản hồi từ VNPay
    private String message;             // Thông báo kết quả
    private String transactionNo;       // Mã giao dịch tại VNPay
    private String txnRef;              // Mã tham chiếu giao dịch
    private Long amount;                // Số tiền đã hoàn
    private String bankCode;            // Mã ngân hàng
    private String orderInfo;           // Thông tin đơn hàng
    private String payDate;             // Thời gian thanh toán
    private String transactionStatus;   // Trạng thái giao dịch
}
