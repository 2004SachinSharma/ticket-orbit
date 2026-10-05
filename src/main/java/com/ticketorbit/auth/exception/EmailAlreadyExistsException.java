package com.ticketorbit.auth.exception;

import com.ticketorbit.common.exception.ApiException;
import org.springframework.http.HttpStatus;

// auth/exception/EmailAlreadyExistsException.java
public class EmailAlreadyExistsException extends ApiException {
    public EmailAlreadyExistsException() {
        super(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email is already registered");
    }
}