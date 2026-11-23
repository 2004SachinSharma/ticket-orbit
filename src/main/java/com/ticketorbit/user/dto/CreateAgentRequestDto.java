package com.ticketorbit.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAgentRequestDto(
		
		@NotBlank
		@Size(min = 2,max = 100)
		String name,
		
		@NotBlank
		@Email
		String email,
		
		@NotBlank
		String password
		
) {
}
