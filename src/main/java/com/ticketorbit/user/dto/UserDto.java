package com.ticketorbit.user.dto;

import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;


public record UserDto(
		 Long id,String name, String email, Role role) {
public static UserDto from(User user) {
	return new UserDto( user.getId(),user.getName(), user.getEmail(), user.getRole());
}
}
