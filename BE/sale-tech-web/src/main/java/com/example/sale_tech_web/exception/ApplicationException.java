package com.example.sale_tech_web.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Getter
public abstract class ApplicationException extends RuntimeException {
    private final ErrorCode errorCode;
    private final HttpStatus httpStatus;
    private final Map<String, Object> details;

    protected ApplicationException(ErrorCode errorCode, HttpStatus httpStatus, String message) {
        this(errorCode, httpStatus, message, null, null);
    }

    protected ApplicationException(ErrorCode errorCode, HttpStatus httpStatus, String message, Map<String, Object> details) {
        this(errorCode, httpStatus, message, details, null);
    }

    protected ApplicationException(ErrorCode errorCode, HttpStatus httpStatus, String message, Throwable cause) {
        this(errorCode, httpStatus, message, null, cause);
    }

    protected ApplicationException(
            ErrorCode errorCode,
            HttpStatus httpStatus,
            String message,
            Map<String, Object> details,
            Throwable cause
    ) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.details = details;
    }

}

