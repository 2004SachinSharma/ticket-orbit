package com.ticketorbit.user.exception;

import com.ticketorbit.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidRoleChangeException extends ApiException {
    public InvalidRoleChangeException() {
        super(HttpStatus.CONFLICT, "INVALID_ROLE_CHANGE","Role change is only allowed between AGENT and ADMIN; CUSTOMER role cannot be set or changed here");
    }
}