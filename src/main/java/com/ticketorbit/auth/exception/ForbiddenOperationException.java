package com.ticketorbit.auth.exception;

import com.ticketorbit.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class ForbiddenOperationException extends ApiException {
public ForbiddenOperationException(String message) {
	super(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
}
}
