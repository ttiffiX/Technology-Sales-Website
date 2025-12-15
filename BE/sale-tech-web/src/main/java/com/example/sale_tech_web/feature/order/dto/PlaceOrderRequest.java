package com.example.sale_tech_web.feature.order.dto;

import com.example.sale_tech_web.feature.order.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlaceOrderRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])\\d{7}$",
            message = "Invalid Vietnamese phone number format"
    )
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 254, message = "Email is too long")
    private String email;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Province is required")
    private String province;

    @Size(max = 1000, message = "Description is too long")
    private String description;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
