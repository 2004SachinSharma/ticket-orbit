package com.ticketorbit.user.controller;

import com.ticketorbit.ticket.dto.PageResponseDto;
import com.ticketorbit.user.dto.ToggleActiveRequestDto;
import com.ticketorbit.user.dto.UpdateUserRoleRequestDto;
import com.ticketorbit.user.dto.UserDto;
import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/users")
public class UserController {

private final UserService userService;

@GetMapping()
public ResponseEntity<PageResponseDto> getAgentsWithSortingAndpagination(
		@RequestParam(defaultValue = "asc", name="sortDir")
		String sortDir,
		
		@RequestParam(defaultValue = "0", name="pageNumber")
		@Min(0) int pageNumber,
		
		@RequestParam(defaultValue = "10", name="pageSize")
		@Min(1) @Max(50) int pageSize,
		
		@RequestParam(required = false, name = "active")
		Boolean active,
		
		@RequestParam(name="role")
		Role role) {
	return ResponseEntity.ok(userService.getAllAgents(sortDir, pageNumber, pageSize, active, role));
}

@PatchMapping("/{id}/active")
public ResponseEntity<UserDto> toggleActive(
		@RequestBody @Valid ToggleActiveRequestDto requestDto,
		@PathVariable("id") @Positive(message = "Id must be a positive number") Long id
) {
	return ResponseEntity.ok(userService.toggleActiveState(requestDto, id));
}

@PatchMapping("/{id}/role")
public ResponseEntity<UserDto> updateRole(
		@RequestBody @Valid UpdateUserRoleRequestDto requestDto,
		@PathVariable("id") @Positive(message = "Id must be a positive number") Long id
) {
	return ResponseEntity.ok(userService.updateUserRole(requestDto, id));
}
}