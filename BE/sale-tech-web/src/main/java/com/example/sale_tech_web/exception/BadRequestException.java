package com.example.sale_tech_web.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class BadRequestException extends ApplicationException {
    public BadRequestException(String message) {
        super(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, message);
    }

    public BadRequestException(String message, Map<String, Object> details) {
        super(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, message, details);
    }
}

