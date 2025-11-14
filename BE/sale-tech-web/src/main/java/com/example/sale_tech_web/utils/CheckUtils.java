package com.example.sale_tech_web.utils;

import java.util.regex.Pattern;

public class CheckUtils {
    // Regex cơ bản và tương đối an toàn để kiểm tra email
    private static final String EMAIL_REGEX =
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$";

    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    public static boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }
        // Sử dụng Matcher để kiểm tra email khớp với mẫu Regex
        return EMAIL_PATTERN.matcher(email).matches();
    }


    //^ và $	Bắt đầu và kết thúc chuỗi
    //(?=.*[a-z])	Ít nhất 1 chữ thường
    //(?=.*[A-Z])	Ít nhất 1 chữ hoa
    //(?=.*\\d)	Ít nhất 1 chữ số
    //(?=.*[@$!%*?&])	Ít nhất 1 ký tự đặc biệt
    //[A-Za-z\\d@$!%*?&]{8,}	Chỉ chứa các ký tự hợp lệ, và tối thiểu 8 ký tự

    private static final String STRONG_PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    private static final Pattern pattern = Pattern.compile(STRONG_PASSWORD_REGEX);

    public static boolean isStrongPassword(String password) {
        if (password == null) return false;
        return pattern.matcher(password).matches();
    }
}
