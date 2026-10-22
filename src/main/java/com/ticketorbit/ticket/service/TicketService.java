package com.ticketorbit.ticket.service;

import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.category.entity.Category;
import com.ticketorbit.category.repository.CategoryRepository;
import com.ticketorbit.common.exception.InvalidStateTransitionException;
import com.ticketorbit.ticket.dto.*;
import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.ticket.repository.TicketRepository;
import com.ticketorbit.ticket.ticket_enum.SlaState;
import com.ticketorbit.ticket.ticket_enum.TicketStatus;
import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TicketService {

private final TicketRepository ticketRepository;
private final CategoryRepository categoryRepository;
private final UserRepository userRepository;

public CustomerTicketResponseDto createTicket(CreateTicketRequestDto request) {
	
	Category category = categoryRepository.findById(request.categoryId())
			                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
	
		
	Ticket ticket = new Ticket();
	ticket.setSubject(request.subject());
	ticket.setDescription(request.description());
	ticket.setCategory(category);
	ticket.setPriority(request.priority());
	ticket.setStatus(TicketStatus.OPEN);
	ticket.setCreatedBy(currentUser());
	ticket.setSlaState(SlaState.ON_TRACK);
	
	return CustomerTicketResponseDto.from(ticketRepository.save(ticket));
	
}

public PageResponseDto getTickets(String sortBy, String sortDirection, int pageNumber, int pageSize) {
	
	
	Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	
	Pageable pageRequest = PageRequest.of(pageNumber,pageSize,sort);
	
	Role role = currentUser().getRole();

//	Role Based filtration: the curr user should be agent and must only access the tickets assigned to them
	if(role.equals(Role.AGENT)) {
		Page<Ticket> agentTicketpages = ticketRepository.findAllByAssignedTo(currentUser(), pageRequest);
		return PageResponseDto.from(agentTicketpages, StaffTicketResponseDto::from);
	}
	
	
//  If curr user is admin then can access all the tickets
	if (role == Role.ADMIN) {
		Page<Ticket> allTicketPages = ticketRepository.findAll(pageRequest);
		return PageResponseDto.from(allTicketPages, StaffTicketResponseDto::from);
	}
	
//  At last then it points that the curr user is customer, then they should see all the tickets created by them
	Page<Ticket> ticketPages = ticketRepository.findAllByCreatedBy(currentUser(), pageRequest);

	return PageResponseDto.from(ticketPages, CustomerTicketResponseDto::from);

}

public TicketResponseDto getTicketById(long ticketId) {
	
	Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
			() -> new ResourceNotFoundException("Ticket not found"));
	
	Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); /*TODO: REMOVE IT*/
	Long userId = Long.valueOf(authentication.getPrincipal().toString()); /*TODO: REMOVE AND USE THE METHOD TO GET THE CURRENT USER; METHOD DEFINED BELOW. FOLLOWING (DRY)*/
	
	Role role = currentUser().getRole();
	
	if (role == Role.CUSTOMER) {
		if (!Objects.equals(ticket.getCreatedBy().getId(), currentUser().getId())) {
			throw new ResourceNotFoundException("Ticket not found");
		}
		return CustomerTicketResponseDto.from(ticket);
	}
	
	if (role == Role.AGENT) {
		if (ticket.getAssignedTo() == null ||
				    !Objects.equals(ticket.getAssignedTo().getId(), currentUser().getId())) {
			throw new ResourceNotFoundException("Ticket not found");
		}
		return StaffTicketResponseDto.from(ticket);
	}
	
	// ADMIN — full access, no ownership check
	return StaffTicketResponseDto.from(ticket);
}


@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Transactional()
public StaffTicketResponseDto assignTicketToAgent(Long ticketId, AssignTicketRequestDto request) {
	
	Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
			() -> new ResourceNotFoundException("Ticket not found")
	);
	
	User agent = userRepository.findById(request.agentId()).orElseThrow(
			()-> new ResourceNotFoundException("Agent not found")
	);
	
	if(agent.getRole() != Role.AGENT) {
		throw new ResourceNotFoundException("Agent not found");
	}
	if(ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.RESOLVED) {
		throw new InvalidStateTransitionException("Cannot assign or reassign a resolved or closed ticket");
	}
	if(ticket.getStatus() == TicketStatus.ASSIGNED ||
	   ticket.getStatus() == TicketStatus.IN_PROGRESS ||
	   ticket.getStatus() == TicketStatus.WAITING_FOR_CUSTOMER) {
		
	   ticket.setAssignedTo(agent);
	   return StaffTicketResponseDto.from(ticketRepository.save(ticket));
	}
	
	ticket.setAssignedTo(agent);
	ticket.setStatus(TicketStatus.ASSIGNED);
	
	return StaffTicketResponseDto.from(ticketRepository.save(ticket));
}

private User currentUser() {
	Long userId = Long.valueOf(SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
	return userRepository.findById(userId)
			       .orElseThrow(() -> new ResourceNotFoundException("User not found"));
}

}
