package com.example.sale_tech_web.feature.payment.processor;

import com.example.sale_tech_web.exception.NotFoundException;
import com.example.sale_tech_web.feature.cart.entity.CartDetail;
import com.example.sale_tech_web.feature.cart.repository.CartDetailRepository;
import com.example.sale_tech_web.feature.order.entity.orders.Order;
import com.example.sale_tech_web.feature.payment.entity.Payment;
import com.example.sale_tech_web.feature.payment.enums.PaymentMethod;
import com.example.sale_tech_web.feature.payment.enums.PaymentStatus;
import com.example.sale_tech_web.feature.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CashPaymentProcessor implements PaymentProcessor {

    private final PaymentRepository paymentRepository;
    private final CartDetailRepository cartDetailRepository;

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.CASH;
    }

    @Override
    public Object createPayment(Order order, Map<String, Object> params) {
        LocalDateTime now = LocalDateTime.now();

        Payment payment = Payment.builder()
                .order(order)
                .status(PaymentStatus.PENDING)
                .provider(PaymentMethod.CASH)
                .amount(order.getTotalPrice())
                .content("Thanh toan tien mat cho don hang #" + order.getId())
                .createdAt(now)
                .updatedAt(now)
                .expiresAt(null)
                // Không cần: transactionId, rawResponse
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("CASH payment created with ID: {}, status: PENDING", savedPayment.getId());

        Object rawCartDetails = params.get("cartDetails");
        if (rawCartDetails instanceof List<?> rawList) {
            // Tạo một list mới sạch sẽ không dính lỗi Generic
            List<CartDetail> cartDetails = new ArrayList<>();
            for (Object obj : rawList) {
                if (obj instanceof CartDetail) {
                    cartDetails.add((CartDetail) obj);
                }
            }

            if (!cartDetails.isEmpty()) {
                cartDetailRepository.deleteAll(cartDetails);
            }
        }

        return "Order placed successfully for user: " + order.getUser().getUsername();
    }

    @Override
    public String cancelPayment(Order order, Map<String, Object> params) {
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment == null) throw new NotFoundException("Payment not found for order ID: " + order.getId());


        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return " and pending payment has been cancelled";
        }
        return "";
    }
}

