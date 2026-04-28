package com.example.sale_tech_web.utils;

public class SlugUtils {
    public static String toSlug(String input) {
        String noWhitespace = input.replaceAll("\\s+", "-");
        String normalized = java.text.Normalizer.normalize(noWhitespace, java.text.Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\p{ASCII}]", "");
        return slug.toLowerCase();
    }
}
