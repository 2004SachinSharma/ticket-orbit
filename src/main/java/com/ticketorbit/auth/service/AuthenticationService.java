package com.ticketorbit.auth.service;

import com.ticketorbit.auth.dto.LoginRequestDto;
import com.ticketorbit.auth.dto.LoginResponseDto;
import com.ticketorbit.auth.dto.RegisterRequestDto;
import com.ticketorbit.auth.exception.EmailAlreadyExistsException;
import com.ticketorbit.auth.security.JwtUtil;
import com.ticketorbit.user.dto.UserDto;
import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.authentication.password.CompromisedPasswordException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.attribute.UserPrincipalNotFoundException;
import java.util.Optional;

import static io.lettuce.core.KillArgs.Builder.id;


@Service
@RequiredArgsConstructor
public class AuthenticationService {

private final CompromisedPasswordChecker compromisedPasswordChecker;
private final UserRepository userRepository;
private final PasswordEncoder passwordEncoder;
private final AuthenticationManager authenticationManager;
private final JwtUtil jwtUtil;

@Transactional
public UserDto registerUser(RegisterRequestDto registerRequestDto) {
	
	String email = registerRequestDto.email().trim().toLowerCase(); //extract email
	String password = registerRequestDto.password(); //extract password
	
	if(userRepository.findByEmail(email).isPresent()) {
		throw new EmailAlreadyExistsException();
	}
	
	if (isCompromised(password)) {
		throw new CompromisedPasswordException("entered password is compromised, please enter strong password");
	}
	
	User user = new User();
	
	user.setEmail(email);
	user.setName(registerRequestDto.name());
	user.setPasswordHash(passwordEncoder.encode(registerRequestDto.password())); //Encode password using Bcrypt password encoder
	user.setRole(Role.CUSTOMER);
	User savedUser = userRepository.saveAndFlush(user);//Don't wait for a flush right before commit, instead flush immediately
	return UserDto.from(savedUser);
}

private boolean isCompromised(String password) {
	return compromisedPasswordChecker.check(password).isCompromised();
}

public LoginResponseDto loginUser(LoginRequestDto loginRequestDto) {
	
	
		Authentication authenticate = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequestDto.email().trim().toLowerCase(), loginRequestDto.password())
		);
	 
		UserDto user = (UserDto) authenticate.getPrincipal();
	
		String token = jwtUtil.generateJwtToken(authenticate);
		
		return new LoginResponseDto(token, user);
}

public UserDto getAuthUser() {
	
	Authentication authentication =
			SecurityContextHolder.getContext().getAuthentication();
	
	Long id = Long.valueOf(authentication.getPrincipal().toString());
	
	User user = userRepository.findById(id)
			            .orElseThrow(() -> new UsernameNotFoundException(
					            "Authenticated user not found with id: " + id
			            ));
	
	return UserDto.from(user);
}

}
