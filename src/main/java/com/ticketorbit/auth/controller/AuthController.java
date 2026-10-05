package com.ticketorbit.auth.controller;

import com.ticketorbit.auth.dto.RegisterRequestDto;
import com.ticketorbit.auth.service.AuthenticationService;
import com.ticketorbit.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

private final AuthenticationService authenticationService;

@PostMapping("/register")
public ResponseEntity<UserDto> registerUser(@Valid @RequestBody RegisterRequestDto registerReqDto) {
	UserDto user = authenticationService.registerUser(registerReqDto);
	
	return ResponseEntity.status(HttpStatus.CREATED).body(user);
}

}
