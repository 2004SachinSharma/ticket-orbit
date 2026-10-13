package com.ticketorbit.common.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public abstract class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final String code;

 protected ApiException(HttpStatus status, String code, String message) {
	super(message);
	this.status = status;
	this.code = code;
}
}