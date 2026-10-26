package com.ticketorbit.user.controller;

import com.ticketorbit.user.dto.UserDto;
import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.service.UserService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

private final UserService userService;

@GetMapping()
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public ResponseEntity<List<UserDto>> getAllUsers(@RequestParam
                                          @NotNull(message="role cannot be null")
                                          Role role) {
	return ResponseEntity.ok(userService.getUsersByRole(role));
}

}
