package com.example.sale_tech_web.utils;

public class StringUtils {
    public static String normalizeText(String text) {
        if (text == null) {
            return null;
        }
        String trimmed = text.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
