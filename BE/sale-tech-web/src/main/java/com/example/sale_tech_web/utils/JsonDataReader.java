package com.example.sale_tech_web.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class JsonDataReader {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Đọc dữ liệu JSON từ file trong resources
     * @param fileName tên file JSON trong thư mục resources
     * @param typeReference kiểu dữ liệu cần parse
     * @return danh sách dữ liệu đã parse
     */
    public static <T> List<T> readJsonData(String fileName, TypeReference<List<T>> typeReference) {
        try {
            ClassPathResource resource = new ClassPathResource(fileName);
            InputStream inputStream = resource.getInputStream();
            return objectMapper.readValue(inputStream, typeReference);
        } catch (IOException e) {
            log.error("Lỗi khi đọc file JSON: " + fileName, e);
            return new ArrayList<>();
        }
    }

    /**
     * Đọc dữ liệu JSON từ file bất kỳ và parse thành đối tượng đơn
     * @param fileName tên file JSON
     * @param valueType class của đối tượng cần parse
     * @return đối tượng đã parse
     */
    public static <T> T readJsonObject(String fileName, Class<T> valueType) {
        try {
            ClassPathResource resource = new ClassPathResource(fileName);
            InputStream inputStream = resource.getInputStream();
            return objectMapper.readValue(inputStream, valueType);
        } catch (IOException e) {
            log.error("Lỗi khi đọc file JSON: " + fileName, e);
            return null;
        }
    }

    /**
     * Đọc dữ liệu JSON dưới dạng String
     * @param fileName tên file JSON
     * @return nội dung file dưới dạng String
     */
    public static String readJsonAsString(String fileName) {
        try {
            ClassPathResource resource = new ClassPathResource(fileName);
            InputStream inputStream = resource.getInputStream();
            return new String(inputStream.readAllBytes());
        } catch (IOException e) {
            log.error("Lỗi khi đọc file JSON: " + fileName, e);
            return null;
        }
    }
}

