package com.example.sale_tech_web.feature.cloudinary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudinaryResponse {
    String imageUrl;
    String publicId;
}
