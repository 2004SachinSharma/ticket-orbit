package com.ticketorbit.common.exception;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
		Instant timestamp,
		int status,
		String code,
		String message,
		String path,
		List<FieldIssue> fieldErrors
) {
public record FieldIssue(String field, String message) {}

public static ErrorResponse of(int status, String code, String message, String path) {
	return new ErrorResponse(Instant.now(), status, code, message, path, List.of());
}

}
