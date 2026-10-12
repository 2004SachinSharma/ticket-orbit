package com.ticketorbit.auth.dto;

import com.ticketorbit.user.dto.UserDto;

public record LoginResponseDto(
		String token,
		UserDto user
) {
}
