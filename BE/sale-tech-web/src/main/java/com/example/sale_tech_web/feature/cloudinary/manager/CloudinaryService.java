package com.example.sale_tech_web.feature.cloudinary.manager;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.sale_tech_web.feature.cloudinary.dto.CloudinaryResponse;
import com.example.sale_tech_web.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryResponse uploadImage(MultipartFile file, String categoryName) throws IOException {
        String slugCategory = SlugUtils.toSlug(categoryName);
        String folderPath = "products/";
        String tempUuid = UUID.randomUUID().toString();
        String publicId = folderPath + slugCategory + "_" + tempUuid;

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "overwrite", true,
                "resource_type", "image"
        ));

        return CloudinaryResponse.builder()
                .imageUrl(uploadResult.get("secure_url").toString())
                .publicId(publicId)
                .build();
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId != null && !publicId.isEmpty()) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }

    public CloudinaryResponse uploadFromUrl(String url, String categoryName) throws IOException {
        String slugCategory = SlugUtils.toSlug(categoryName);
        String folderPath = "products/";
        String tempUuid = UUID.randomUUID().toString();
        String publicId = folderPath + slugCategory + "_" + tempUuid;

        Map uploadResult = cloudinary.uploader().upload(url, ObjectUtils.asMap(
                "public_id", publicId
        ));
        return CloudinaryResponse.builder()
                .imageUrl(uploadResult.get("secure_url").toString())
                .publicId(publicId)
                .build();
    }
}
