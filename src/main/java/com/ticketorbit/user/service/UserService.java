package com.ticketorbit.user.service;

 import com.ticketorbit.user.dto.UserDto;
import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

private final UserRepository userRepository;

public List<UserDto> getUsersByRole(Role role) {
 
 List<User> users = userRepository.findAllByRole(role);
 return  users.stream().map(UserDto::from).collect(Collectors.toList());
 
 
}
}
