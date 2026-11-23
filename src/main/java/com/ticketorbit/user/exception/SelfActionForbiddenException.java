package com.ticketorbit.user.exception;

import com.ticketorbit.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class SelfActionForbiddenException extends ApiException {
public SelfActionForbiddenException(String message) {
	
	super(HttpStatus.CONFLICT, "SELF_ACTION_FORBIDDEN", message);
}
}
