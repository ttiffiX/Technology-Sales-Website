package com.example.sale_tech_web.exception;

import org.springframework.http.HttpStatus;

public class TooManyRequestsException extends ApplicationException {
    public TooManyRequestsException(String message) {
        super(ErrorCode.TOO_MANY_REQUESTS, HttpStatus.TOO_MANY_REQUESTS, message);
    }
}

