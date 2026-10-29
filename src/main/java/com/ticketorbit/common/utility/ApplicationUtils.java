package com.ticketorbit.common.utility;

import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class SecurityUtils {

private final UserRepository userRepository;

public User currentUser() {
	Long userId = Long.valueOf(
			SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString()
	);
	return userRepository.findById(userId)
			       .orElseThrow(() -> new ResourceNotFoundException("User not found"));
}
}