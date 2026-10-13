package com.ticketorbit.auth.controller;

import com.ticketorbit.auth.dto.LoginRequestDto;
import com.ticketorbit.auth.dto.LoginResponseDto;
import com.ticketorbit.auth.dto.RegisterRequestDto;
import com.ticketorbit.auth.service.AuthenticationService;
import com.ticketorbit.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

private final AuthenticationService authenticationService;

@PostMapping("/register/public")
public ResponseEntity<UserDto> registerUser(@Valid @RequestBody RegisterRequestDto registerReqDto) {
	UserDto user = authenticationService.registerUser(registerReqDto);
	
	return ResponseEntity.status(HttpStatus.CREATED).body(user);
}

@PostMapping("/login/public")
public ResponseEntity<LoginResponseDto> loginUser(@Valid @RequestBody LoginRequestDto loginReqDto) {
	LoginResponseDto loginedUser = authenticationService.loginUser(loginReqDto);
	
	 return ResponseEntity.status(HttpStatus.OK).body(loginedUser);
}

@GetMapping("/me")
public ResponseEntity<UserDto> getCurrAuthUser(){
	
 return ResponseEntity.ok(	authenticationService.getAuthUser());
	
}

}
