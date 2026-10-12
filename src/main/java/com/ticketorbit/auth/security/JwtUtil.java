package com.ticketorbit.auth.security;

import com.ticketorbit.user.dto.UserDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

@Value("${jwt.secret}")
private String jwtSecret;

@Value("${jwt.expiration}")
private long jwtExpiration; // milliseconds

private SecretKey secretKey;

@PostConstruct
void init() {
	// Fails fast at startup if the secret is shorter than 32 bytes
	this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
}

public String generateJwtToken(Authentication authentication) {
	UserDto user = (UserDto) authentication.getPrincipal(); //Here it is authenticated user,
	
	Date issuedAt = new Date();
	Date expiration = new Date(issuedAt.getTime() + jwtExpiration);
	
	return Jwts.builder()
			       .issuer("TicketOrbit")
			       .subject(String.valueOf(user.id()))
			       .claim("role", user.role())
			       .issuedAt(issuedAt)
			       .expiration(expiration) //what else more to see-> how to not only setime in the header but actually to invalidate the JWT after 1 hr, and refreshing the token
			       .signWith(secretKey)
			       .compact();
}

//public boolean validateToken(String token) {
//	try {
//		parseClaims(token);
//		return true;
//	} catch (JwtException | IllegalArgumentException e) {
//		log.warn("Invalid JWT: {}", e.getMessage());
//		return false;
//	}
//}
//
//public Long getUserIdFromToken(String token) {
//	return Long.valueOf(parseClaims(token).getSubject());
//}
//
//public String getRoleFromToken(String token) {
//	return parseClaims(token).get("role", String.class);
//}
//
public Claims parseClaims(String token) {
	return Jwts.parser()
			       .verifyWith(secretKey)
			       .requireIssuer("TicketOrbit")
			       .build()
			       .parseSignedClaims(token)
			       .getPayload();
}
}