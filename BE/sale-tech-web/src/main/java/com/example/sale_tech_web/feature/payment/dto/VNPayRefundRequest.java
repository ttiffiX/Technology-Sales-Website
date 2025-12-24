package com.example.sale_tech_web.feature.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayRefundRequest {
    private String txnRef;              // Mã giao dịch gốc
    private Long amount;                // Số tiền hoàn trả (VND)
    private String transactionType;     // "02": Hoàn trả toàn phần, "03": Hoàn trả một phần
    private String transactionDate;     // Ngày giao dịch gốc (yyyyMMddHHmmss)
    private String transactionNo;       // Mã giao dịch tại VNPay (nếu có)
    private String createBy;            // Người thực hiện hoàn tiền
    private String orderInfo;           // Thông tin đơn hàng
}

