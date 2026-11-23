package com.ticketorbit.common.exception;

import com.ticketorbit.auth.exception.EmailAlreadyExistsException;
import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.ticket.exception.InvalidStateTransitionException;
import com.ticketorbit.user.exception.InvalidRoleChangeException;
import com.ticketorbit.user.exception.LastAdminProtectionException;
import com.ticketorbit.user.exception.SelfActionForbiddenException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.password.CompromisedPasswordException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

@ExceptionHandler(EmailAlreadyExistsException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmail(EmailAlreadyExistsException ex, HttpServletRequest req) {
	return ResponseEntity.status(HttpStatus.CONFLICT)
			       .body(ErrorResponse.of(
					       409,
					       ex.getCode(),
					       ex.getMessage(),
					       req.getRequestURI()));
}

// On @Valid failure (for multiple fields)
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
	log.warn("Compromised password attempt detected", ex);
	return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse.of(
			400, "VALIDATION_ERROR", ex.getMessage(), req.getRequestURI()));
}

@ExceptionHandler(AuthenticationException.class)   // BadCredentialsException is the child of this Exception itself
public ResponseEntity<ErrorResponse> handleAuth(AuthenticationException ex, HttpServletRequest req) {
	return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ErrorResponse.of(
			401, "INVALID_CREDENTIALS", "Invalid email or password", req.getRequestURI()));
}

@ExceptionHandler(AccessDeniedException.class)    // org.springframework.security.access
public ResponseEntity<ErrorResponse> handleDenied(AccessDeniedException ex, HttpServletRequest req) {
	return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ErrorResponse.of(
			403, "ACCESS_DENIED", "You don't have permission", req.getRequestURI()));
}

@ExceptionHandler(NoResourceFoundException.class)
public ResponseEntity<ErrorResponse> handleNoResource(
		NoResourceFoundException ex,
		HttpServletRequest req) {
	
	return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
			ErrorResponse.of(
					404,
					"INVALID_ENDPOINT",
					"Requested endpoint does not exist",
					req.getRequestURI()
			)
	);
}

@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
	return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
			ErrorResponse.of(
					404,
					"RESOURCE_NOT_FOUND",
					ex.getMessage(),
					req.getRequestURI()
			)
	);
}

@ExceptionHandler(PropertyReferenceException.class)
public ResponseEntity<ErrorResponse> handleInvalidSort(PropertyReferenceException ex, HttpServletRequest request) {
	ErrorResponse error = new ErrorResponse(
			Instant.now(), 400, "INVALID_SORT_FIELD",
			"Invalid sort field: " + ex.getPropertyName(),
			request.getRequestURI(), List.of()
	);
	return ResponseEntity.badRequest().body(error);
}

@ExceptionHandler(ConstraintViolationException.class)
public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest req) {
	List<ErrorResponse.FieldIssue> issues = ex.getConstraintViolations().stream()
			                                        .map(v -> new ErrorResponse.FieldIssue(v.getPropertyPath().toString(), v.getMessage()))
			                                        .toList();
	return ResponseEntity.badRequest().body(new ErrorResponse(
			Instant.now(), 400, "VALIDATION_ERROR", "Validation failed",
			req.getRequestURI(), issues));
}

@ExceptionHandler(MissingServletRequestParameterException.class)
public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
	return ResponseEntity.badRequest().body(ErrorResponse.of(
			400, "VALIDATION_ERROR", ex.getMessage(), req.getRequestURI()));
}

@ExceptionHandler(InvalidStateTransitionException.class)
public ResponseEntity<ErrorResponse> handleInvalidState(InvalidStateTransitionException ex, HttpServletRequest request) {
	return ResponseEntity.status(HttpStatus.CONFLICT)
			       .body(ErrorResponse.of(409,
					       ex.getCode(),
					       ex.getMessage(),
					       request.getRequestURI())
			       );
}

@ExceptionHandler(IllegalArgumentException.class)
public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
	return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			       .body(ErrorResponse.of(400,
					       "INVALID_REQUEST_PARAM",
					       ex.getMessage(),
					       request.getRequestURI())
			       );
}

@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
	String message = String.format("Invalid value for parameter '%s'", ex.getName());
	
	return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			       .body(ErrorResponse.of(400,
					       "INVALID_PARAM_TYPE",
					       message,
					       request.getRequestURI())
			       );
}

@ExceptionHandler(ObjectOptimisticLockingFailureException.class)
public ResponseEntity<ErrorResponse> handleOptimisticLockingViolation(ObjectOptimisticLockingFailureException ex, HttpServletRequest request) {
	
	String message = String.format("This ticket was modified by another user. Please refresh and try again '%s'", ex.getMessage());
	
	return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse.of(
			409,
			"OPTIMISTIC_LOCK_CONFLICT",
			message,
			request.getRequestURI())
	);
}

@ExceptionHandler(SelfActionForbiddenException.class)
public ResponseEntity<ErrorResponse> handleLastAdminProtection(SelfActionForbiddenException ex, HttpServletRequest request) {
	return ResponseEntity.status(HttpStatus.CONFLICT)
			       .body(ErrorResponse.of(
					       409,
					       ex.getCode(),
					       ex.getMessage(),
					       request.getRequestURI())
			       );
}

@ExceptionHandler(LastAdminProtectionException.class)
public ResponseEntity<ErrorResponse> handleLastAdminProtection(LastAdminProtectionException ex, HttpServletRequest request) {
	return ResponseEntity.status(HttpStatus.CONFLICT)
			       .body(ErrorResponse.of(
					       409,
					       ex.getCode(),
					       ex.getMessage(),
					       request.getRequestURI())
			       );
}

@ExceptionHandler(InvalidRoleChangeException.class)
public ResponseEntity<ErrorResponse> handleInvalidRoleChange(InvalidRoleChangeException ex, HttpServletRequest request) {
	return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			       .body(ErrorResponse.of(400, ex.getCode(), ex.getMessage(), request.getRequestURI()));
}

@ExceptionHandler(ApiException.class)
public ResponseEntity<ErrorResponse> handleApi(ApiException ex, HttpServletRequest req) {
	return ResponseEntity.status(ex.getStatus())
			       .body(ErrorResponse.of(ex.getStatus().value(), ex.getCode(),
					       ex.getMessage(), req.getRequestURI()));
}

// All that could not be caught in the above specific exceptions will be handled here
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest req) {
	log.error("Unexpected error", ex);
	return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ErrorResponse.of(
			500, "INTERNAL_ERROR", "Something went wrong", req.getRequestURI()));
}
}