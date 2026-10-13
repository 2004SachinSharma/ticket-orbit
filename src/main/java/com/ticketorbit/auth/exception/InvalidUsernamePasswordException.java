package com.ticketorbit.auth.exception;

public class InvalidUsernamePasswordException extends RuntimeException {
public InvalidUsernamePasswordException(String message) {
	super(message);
}
}
