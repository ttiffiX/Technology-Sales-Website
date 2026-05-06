package com.example.sale_tech_web.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class ConflictException extends ApplicationException {
    public ConflictException(String message) {
        super(ErrorCode.CONFLICT, HttpStatus.CONFLICT, message);
    }

    public ConflictException(String message, Map<String, Object> details) {
        super(ErrorCode.CONFLICT, HttpStatus.CONFLICT, message, details);
    }
}

