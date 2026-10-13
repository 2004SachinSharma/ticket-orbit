package com.ticketorbit.auth.exception;

import com.ticketorbit.common.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class SecurityErrorHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

private final tools.jackson.databind.ObjectMapper objectMapper;

@Override   // 401
public void commence(HttpServletRequest req, HttpServletResponse res,
                     AuthenticationException ex) throws IOException {
	writeError(req, res, 401, "UNAUTHORIZED", "Login required");
}

@Override   // 403
public void handle(HttpServletRequest req, HttpServletResponse res,
                   AccessDeniedException ex) throws IOException {
	writeError(req, res, 403, "ACCESS_DENIED", "You don't have permission");
}

private void writeError(HttpServletRequest req, HttpServletResponse res,
                        int status, String code, String message) throws IOException {
	res.setStatus(status);
	res.setContentType(MediaType.APPLICATION_JSON_VALUE);
	objectMapper.writeValue(res.getOutputStream(),
			ErrorResponse.of(status, code, message, req.getRequestURI()));
}
}