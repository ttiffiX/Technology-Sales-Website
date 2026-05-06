package com.example.sale_tech_web.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class NotFoundException extends ApplicationException {
    public NotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }

    public NotFoundException(String message, Map<String, Object> details) {
        super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message, details);
    }
}

