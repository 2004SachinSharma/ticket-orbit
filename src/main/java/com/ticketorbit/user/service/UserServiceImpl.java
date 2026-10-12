package com.ticketorbit.user.service;

import com.ticketorbit.user.dto.UserDto;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserServiceImpl implements UserService {

private final UserRepository userRepository;

@Override
public UserDto findByEmail(@RequestParam String email) throws BadRequestException {
	Optional<User> user = userRepository.findByEmail(email);
	
	if (user.isEmpty()) {
		throw new BadRequestException("User not found");
	}
	
	return UserDto.from(user.get());
	
}

}
