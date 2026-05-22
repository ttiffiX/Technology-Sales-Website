package com.example.sale_tech_web.feature.product_reviews.dto.pm;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyRequestDTO {
    @NotNull
    private Long parentId;

    private String comment;
}
