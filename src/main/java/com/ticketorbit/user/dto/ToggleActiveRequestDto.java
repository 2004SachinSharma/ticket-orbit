package com.ticketorbit.user.dto;

import jakarta.validation.constraints.NotNull;

public record ToggleActiveRequestDto(
		@NotNull(message="active Boolean cannot be null, kindly provide value Boolean value")
		Boolean active
) {
}
