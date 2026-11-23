package com.ticketorbit.user.dto;

import com.ticketorbit.user.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequestDto(
		@NotNull(message = "Role cannot be null, kindly provide valid role")
		Role role
) {
}
