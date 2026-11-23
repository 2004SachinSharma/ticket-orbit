package com.ticketorbit.ticket.exception;

import com.ticketorbit.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidStateTransitionException extends ApiException {
public InvalidStateTransitionException(String message) {
super(HttpStatus.CONFLICT,"INVALID_TICKET_STATE",message);
}
}
