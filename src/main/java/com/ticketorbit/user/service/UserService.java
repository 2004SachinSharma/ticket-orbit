package com.ticketorbit.user.service;

import com.ticketorbit.user.dto.UserDto;
import org.apache.coyote.BadRequestException;

public interface UserService {
	UserDto findByEmail(String email) throws BadRequestException;
}
