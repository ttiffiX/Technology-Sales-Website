package com.example.sale_tech_web.exception;

import org.springframework.http.HttpStatus;

public class UnprocessableEntityException extends ApplicationException {
    public UnprocessableEntityException(String message) {
        super(ErrorCode.BAD_REQUEST, HttpStatus.UNPROCESSABLE_ENTITY, message);
    }
}

