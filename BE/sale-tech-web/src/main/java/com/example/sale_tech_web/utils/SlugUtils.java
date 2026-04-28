package com.example.sale_tech_web.utils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtils {
    public static String toSlug(String input) {
        if (input == null || input.isEmpty()) return "";

        // 1. Chuyển sang dạng Normalization NFD (tách dấu ra khỏi chữ)
        String nfdNormalizedString = Normalizer.normalize(input, Normalizer.Form.NFD);

        // 2. Loại bỏ các dấu (diacritics)
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String result = pattern.matcher(nfdNormalizedString).replaceAll("");

        // 3. Xử lý riêng chữ 'Đ' và 'đ' (Normalizer đôi khi bỏ sót)
        result = result.replace("Đ", "D").replace("đ", "d");

        // 4. Chuyển về chữ thường
        result = result.toLowerCase();

        // 5. Thay thế các ký tự không phải chữ/số bằng dấu gạch ngang
        result = result.replaceAll("[^a-z0-9]", "-");

        // 6. Xóa các dấu gạch ngang thừa (nếu có 2 dấu liên tiếp)
        result = result.replaceAll("-+", "-");

        // 7. Xóa dấu gạch ngang ở đầu và cuối chuỗi
        result = result.replaceAll("^-|-$", "");

        return result;
    }
}
