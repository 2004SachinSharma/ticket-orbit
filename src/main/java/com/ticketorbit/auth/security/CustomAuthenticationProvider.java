package com.ticketorbit.auth.security;

import com.ticketorbit.user.dto.UserDto;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationProvider implements AuthenticationProvider {

private final UserRepository userRepository;
private final PasswordEncoder passwordEncoder;

@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
	
	String email = authentication.getName();
	Object credentials = authentication.getCredentials();
	
	if (credentials == null) {
		throw new BadCredentialsException("Invalid credentials");
	}
	
	User user = userRepository.findByEmail(email)
			            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
	
	if(!user.isActive()) {
		throw new BadCredentialsException("Invalid email or password"); //allow the users to login only if isActive = true in database records
	}
	
	if (!passwordEncoder.matches(credentials.toString(), user.getPasswordHash())) {
		throw new BadCredentialsException("Invalid credentials");
	}
	
	List<SimpleGrantedAuthority> authorities =
			List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
	
	return new UsernamePasswordAuthenticationToken(UserDto.from(user), null, authorities); //Now its returning an authenticated object
}

@Override
public boolean supports(Class<?> authentication) {
	return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
}
}