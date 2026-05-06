package com.example.sale_tech_web.exception;

import com.fasterxml.jackson.databind.exc.ValueInstantiationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class ExceptionController {

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ErrorResponse> handleApplicationException(ApplicationException ex) {
        log.warn("Application exception: {}", ex.getMessage());
        return buildErrorResponse(ex.getHttpStatus(), ex.getErrorCode().name(), ex.getMessage(), ex.getDetails());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleStatusException(ResponseStatusException ex) {
        log.warn("ResponseStatusException: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.valueOf(ex.getStatusCode().value()),
                ErrorCode.BAD_REQUEST.name(),
                ex.getReason(),
                null
        );
    }

    /**
     * Bắt lỗi khi JSON gửi lên không hợp lệ hoặc sai định dạng Enum
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        log.warn("JSON Parse Error: {}", ex.getMessage());

        // Kiểm tra xem nguyên nhân gốc rễ có phải là ResponseStatusException từ Enum không
        Throwable cause = ex.getCause();
        if (cause instanceof ValueInstantiationException && cause.getCause() instanceof ApplicationException appEx) {
            return buildErrorResponse(appEx.getHttpStatus(), appEx.getErrorCode().name(), appEx.getMessage(), appEx.getDetails());
        }

        if (cause instanceof ValueInstantiationException && cause.getCause() instanceof ResponseStatusException rse) {
            return buildErrorResponse(
                    HttpStatus.valueOf(rse.getStatusCode().value()),
                    ErrorCode.BAD_REQUEST.name(),
                    rse.getReason(),
                    null
            );
        }

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ErrorCode.MALFORMED_JSON.name(),
                "Malformed JSON request or invalid data format",
                null
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        log.warn("Validation Error: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> details = new HashMap<>();
        details.put("errors", errors);

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED.name(),
                "Validation failed",
                details
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        log.warn("File upload error: {}", exc.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST.name(), exc.getMessage(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access Denied: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                ErrorCode.ACCESS_DENIED.name(),
                "Access denied: you do not have permission to access this resource",
                null
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOther(Exception ex) {
        log.error("Unexpected error: ", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_SERVER_ERROR.name(),
                "Internal server error",
                null
        );
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            HttpStatus status,
            String errorCode,
            String message,
            Map<String, Object> details
    ) {
        ErrorResponse response = new ErrorResponse(
                status.value(),
                errorCode,
                message,
                details,
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(response);
    }
}