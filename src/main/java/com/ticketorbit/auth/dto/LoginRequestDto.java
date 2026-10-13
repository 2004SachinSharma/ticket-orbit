package com.ticketorbit.auth.dto;

import jakarta.validation.constraints.*;

public record LoginRequestDto(
		
		@NotBlank(message = "Email is required")
		@Size(max=255, message= "Email length must be at most 255 characters")
		@Email(message = "Email format is invalid")
		String email,
		
		@NotBlank(message = "Password is required")
		String password
) {

}
