package com.example.sale_tech_web.feature.product_reviews.dto.pm;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyRequestDTO {
    @NotBlank(message = "Comment must not be blank")
    private String comment;
}
