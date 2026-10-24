package com.ticketorbit.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDto(
		@NotBlank(message= "Name required")
		@Size(max = 100, message="Name length can be at most 100 characters")
		String name,
		
		@Size(max = 255, message = "Email length must be at most 255 characters")
		@Email(message = "Email format is invalid")
		@NotBlank(message = "Email is required")
		String email,
		
		@NotBlank(message = "Password is required")
		String password) {
}
