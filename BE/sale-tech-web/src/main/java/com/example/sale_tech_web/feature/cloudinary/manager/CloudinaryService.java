package com.example.sale_tech_web.feature.cloudinary.manager;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.sale_tech_web.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String categoryName, Long productId) throws IOException {
        String slugCategory = SlugUtils.toSlug(categoryName);
        String publicId = slugCategory + "_" + productId;

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "overwrite", true,
                "resource_type", "image"
        ));
        return uploadResult.get("secure_url").toString();
    }
}
