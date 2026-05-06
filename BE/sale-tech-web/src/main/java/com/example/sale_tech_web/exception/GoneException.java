package com.example.sale_tech_web.exception;

import org.springframework.http.HttpStatus;

public class GoneException extends ApplicationException {
    public GoneException(String message) {
        super(ErrorCode.GONE, HttpStatus.GONE, message);
    }
}

