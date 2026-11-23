package com.ticketorbit.user.exception;

import com.ticketorbit.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class LastAdminProtectionException extends ApiException {
public LastAdminProtectionException(String message) {
	
	super(HttpStatus.CONFLICT, "LAST_ADMIN_PROTECTION", message);
}
}
