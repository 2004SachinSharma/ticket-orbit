package com.ticketorbit.auth.security;

import com.ticketorbit.auth.exception.SecurityErrorHandler;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Description("Through this class implementation, the JWT is verified" +
		             " and the authenticated user details are injected" +
		             " into the SecurityContext for downstream request authorization.")
public class JwtTokenValidatorFilter extends OncePerRequestFilter {

private final AntPathMatcher pathMatcher = new AntPathMatcher();
private final JwtUtil jwtUtil;
private final SecurityErrorHandler errorHandler;

@Description("For every single request if shouldNotFilter(...) returns true then this method would not run, otherwise if" +
		             "it returns false then this method would execute and would verify the JWT token from the authorization header" +
		             "of the request, and if all good then set the security context with authenticated token containing " +
		             "principle and authorities")
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
	String header = request.getHeader(HttpHeaders.AUTHORIZATION);

	if (header != null && header.startsWith("Bearer ")) {
		try {
			String jwt = header.substring(7);
			
			Claims claims = jwtUtil.parseClaims(jwt);
			
			String userId = claims.getSubject();
			String role = claims.get("role", String.class);
			
			var authentication = new UsernamePasswordAuthenticationToken(userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
			
			authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

			SecurityContextHolder.getContext().setAuthentication(authentication);
			
			
		} catch
		(JwtException | IllegalArgumentException e) {
			
			errorHandler.commence(request, response, new BadCredentialsException("Invalid or expired token"));
			log.error(e.getMessage());
			
			return;
		}
		
	}
	filterChain.doFilter(request, response);
}


@Description("It looks, for what endpoints the above doFilterInternal should not run and" +
		             " try to look and verify JWT token from the Authorization header per request")
protected boolean shouldNotFilter(HttpServletRequest request) {
	return pathMatcher.match("/**/public", request.getRequestURI());
	
}

}
