package com.ticketorbit.user.service;

import com.ticketorbit.auth.exception.EmailAlreadyExistsException;
import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.common.utility.ApplicationUtils;
import com.ticketorbit.ticket.dto.PageResponseDto;
import com.ticketorbit.user.dto.CreateAgentRequestDto;
import com.ticketorbit.user.dto.ToggleActiveRequestDto;
import com.ticketorbit.user.dto.UpdateUserRoleRequestDto;
import com.ticketorbit.user.dto.UserDto;
import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.exception.InvalidRoleChangeException;
import com.ticketorbit.user.exception.LastAdminProtectionException;
import com.ticketorbit.user.exception.SelfActionForbiddenException;
import com.ticketorbit.user.repository.UserRepository;
import com.ticketorbit.user.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.authentication.password.CompromisedPasswordException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class UserService {

private final UserRepository userRepository;
private final PasswordEncoder passwordEncoder;
private final CompromisedPasswordChecker compromisedPasswordChecker;
private final ApplicationUtils applicationUtils;

@Transactional(readOnly = true)
public PageResponseDto getAllAgents( String sortDirection, int pageNumber, int pageSize, Boolean active, Role role ) {
 
 if(role == Role.CUSTOMER){
  throw new IllegalArgumentException("admin cannot get the customer data");
 }
 
 if (!sortDirection.equalsIgnoreCase("asc")
             && !sortDirection.equalsIgnoreCase("desc")) {
  throw new IllegalArgumentException(
          "sortDir must be either 'asc' or 'desc'"
  );
 }
 
 Sort sort = sortDirection.equalsIgnoreCase("asc")?
                     Sort.by("createdAt").ascending():
                     Sort.by("createdAt").descending();
 
 
 Pageable pageRequest = PageRequest.of(pageNumber, pageSize, sort);
 
 Specification<User> specification = (root, query, cb) -> cb.conjunction();
 
 if(active != null){
  specification = specification.and(UserSpecification.hasActive(active));
 }
 if(role != null){
  specification = specification.and(UserSpecification.hasRole(role));
 }
 
 Page<User> agentPages = userRepository.findAll( specification, pageRequest );
 return PageResponseDto.from(agentPages, UserDto::from);
 
}


public List<UserDto> getUsersByRole(Role role) {
 List<User> users = userRepository.findAllByRole(role);
 return  users.stream().map(UserDto::from).collect(Collectors.toList());
}

public UserDto saveAgent(CreateAgentRequestDto requestDto) {
 String email = requestDto.email().trim().toLowerCase();
 String password = requestDto.password();
 boolean emailExists = userRepository.findByEmail(email).isPresent();
 
 if (emailExists) {
  throw new EmailAlreadyExistsException();
 }
 
 if (isCompromised(password)) {
  throw new CompromisedPasswordException("entered password is compromised, please enter strong password");
 }
 
 User agent = new User();
 agent.setName(requestDto.name());
 agent.setEmail(email);
 agent.setPasswordHash(passwordEncoder.encode(password));
 agent.setRole(Role.AGENT);
 agent.setActive(true);
 User savedAgent = userRepository.saveAndFlush(agent);
 
 return UserDto.from(savedAgent);
}

private boolean isCompromised(String password) {
 return compromisedPasswordChecker.check(password).isCompromised();
}

public UserDto toggleActiveState(ToggleActiveRequestDto requestDto, Long targetId) {
 User currentAdmin = applicationUtils.getCurrentAuthUser();
 
 if (Objects.equals(currentAdmin.getId(), targetId)) {
  throw new SelfActionForbiddenException("Admin cannot toggle activation for their own account");
 }
 
 User targetUser = userRepository.findById(targetId)
                           .orElseThrow(() -> new ResourceNotFoundException("User not found"));
 
 boolean isDeactivatingAnAdmin = targetUser.getRole() == Role.ADMIN
                                         && Boolean.FALSE.equals(requestDto.active());
 
 if (isDeactivatingAnAdmin && userRepository.countByRoleAndActiveTrue(Role.ADMIN) == 1) {
  throw new LastAdminProtectionException("Cannot deactivate the last active admin");
 }
 
 targetUser.setActive(requestDto.active());
 userRepository.save(targetUser);
 
 return UserDto.from(targetUser);
}
public UserDto updateUserRole(UpdateUserRoleRequestDto requestDto, Long targetId) {
 User currentAdmin = applicationUtils.getCurrentAuthUser();
 
 User targetUser = userRepository.findById(targetId)
                           .orElseThrow(() -> new ResourceNotFoundException("User not found"));
 
 if (targetUser.getRole() == Role.CUSTOMER || requestDto.role() == Role.CUSTOMER) {
  throw new InvalidRoleChangeException();
 
 }
 
 if (Objects.equals(currentAdmin.getId(), targetId)) {
  throw new SelfActionForbiddenException("Admin cannot change their own role");
 }
 
 boolean isDemotingAnAdmin = targetUser.getRole() == Role.ADMIN
                                     && requestDto.role() != Role.ADMIN;
 
 if (isDemotingAnAdmin && userRepository.countByRoleAndActiveTrue(Role.ADMIN) == 1) {
  throw new LastAdminProtectionException("Cannot demote the last active admin");
 }
 
 targetUser.setRole(requestDto.role());
 userRepository.save(targetUser);
 
 return UserDto.from(targetUser);
}
}