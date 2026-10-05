package com.ticketorbit.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.password.CompromisedPasswordException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

// common/exception/GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Hamari saari feature exceptions yahin aati hain
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(ApiException ex, HttpServletRequest req) {
        return ResponseEntity.status(ex.getStatus())
                .body(ErrorResponse.of(ex.getStatus().value(), ex.getCode(),
                                       ex.getMessage(), req.getRequestURI()));
    }

    // @Valid fail hone par (kai fields ek saath)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                          HttpServletRequest req) {
        List<ErrorResponse.FieldIssue> issues = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErrorResponse.FieldIssue(e.getField(), e.getDefaultMessage()))
                .toList();

        return ResponseEntity.badRequest().body(new ErrorResponse(
                Instant.now(), ex.getStatusCode().value(), "VALIDATION_ERROR", ex.getMessage(),
                req.getRequestURI(), issues));
    }

@ExceptionHandler(CompromisedPasswordException.class)
public ResponseEntity<ErrorResponse> handleCompromisedPassword(CompromisedPasswordException ex, HttpServletRequest req) {
    log.error("Unexpected error", ex);
    return ResponseEntity.status(400).body(ErrorResponse.of(
            400, "VALIDATION_ERROR", ex.getMessage(), req.getRequestURI()));
}


// Jo kuch aur pakda nahi gaya (bug), stack trace client ko nahi jaata
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest req) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(500).body(ErrorResponse.of(
                500, "INTERNAL_ERROR", "Something went wrong", req.getRequestURI()));
    }
}