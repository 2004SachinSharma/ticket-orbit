package com.ticketorbit.ticket.service;

import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.category.entity.Category;
import com.ticketorbit.category.repository.CategoryRepository;
import com.ticketorbit.common.exception.InvalidStateTransitionException;
import com.ticketorbit.common.utility.ApplicationUtils;
import com.ticketorbit.ticket.dto.*;
import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.ticket.repository.TicketRepository;
import com.ticketorbit.ticket.specification.TicketSpecifications;
import com.ticketorbit.ticket.ticket_enum.SlaState;
import com.ticketorbit.ticket.ticket_enum.TicketPriority;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TicketService {

private final TicketRepository ticketRepository;
private final CategoryRepository categoryRepository;
private final UserRepository userRepository;
private final ApplicationUtils applicationUtils;
public CustomerTicketResponseDto createTicket(CreateTicketRequestDto request) {
	
	Category category = categoryRepository.findById(request.categoryId())
			                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
	
	
	Ticket ticket = new Ticket();
	ticket.setSubject(request.subject());
	ticket.setDescription(request.description());
	ticket.setCategory(category);
	ticket.setPriority(request.priority());
	ticket.setStatus(TicketStatus.OPEN);
	ticket.setCreatedBy(applicationUtils.getCurrentAuthUser());
	ticket.setSlaState(SlaState.ON_TRACK);
	
	return CustomerTicketResponseDto.from(ticketRepository.save(ticket));
	
}

public PageResponseDto getTickets(String sortBy, String sortDirection, int pageNumber, int pageSize, TicketStatus status, TicketPriority priority, Long categoryId, Long assignedTo,String q, LocalDateTime from, LocalDateTime to) {
	Set<String> allowedSortFields = Set.of(
			"createdAt",
			"priority",
			"status",
			"subject",
			"updatedAt"
	);
	
	if (!allowedSortFields.contains(sortBy)) {
		throw new IllegalArgumentException("Invalid sortBy field");
	}
	
	if (!sortDirection.equalsIgnoreCase("asc")
			    && !sortDirection.equalsIgnoreCase("desc")) {
		throw new IllegalArgumentException(
				"sortDir must be either 'asc' or 'desc'"
		);
	}
	
	Sort sort = sortDirection.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
	
	Pageable pageRequest = PageRequest.of(pageNumber, pageSize, sort);
	
	User user = applicationUtils.getCurrentAuthUser();
	Role role = user.getRole();
	
	Specification<Ticket> specification = (root, query, cb) -> cb.conjunction();
	
	if (status != null) {
		specification = specification.and(TicketSpecifications.hasStatus(status));
	}
	if (priority != null) {
		specification = specification.and(TicketSpecifications.hasPriority(priority));
	}
	if (categoryId != null) {
		specification = specification.and(TicketSpecifications.hasCategory(categoryId));
	}
	if (q != null && !q.isBlank()) {
		specification = specification.and(TicketSpecifications.matchesSearch(q));
	}
	if (from != null) {
		specification = specification.and(TicketSpecifications.createdAfter(from));
	}
	if (to != null) {
		specification = specification.and(TicketSpecifications.createdBefore(to));
	}

//	Role Based filtration: the curr user should be agent and must only access the tickets assigned to them
	if (role.equals(Role.AGENT)) {
		specification = Specification.where(TicketSpecifications.assignedTo(user)).and(specification);
		Page<Ticket> agentTicketpages = ticketRepository.findAll(specification, pageRequest);
		return PageResponseDto.from(agentTicketpages, StaffTicketResponseDto::from);
	}


//  If curr user is admin then can access all the tickets
	if (role == Role.ADMIN) {
		
		if (assignedTo != null) {
			specification = specification.and(TicketSpecifications.isAssignedTo(assignedTo));
		}
		
		Page<Ticket> allTicketPages = ticketRepository.findAll(specification, pageRequest);
		
		return PageResponseDto.from(allTicketPages, StaffTicketResponseDto::from);
	}

//  At last then it points that the curr user is customer, then they should see all the tickets created by them along with the specification
	specification = Specification.where(TicketSpecifications.createdBy(user)).and(specification);
	Page<Ticket> customerTicketPages = ticketRepository.findAll(specification, pageRequest);
	
	
	return PageResponseDto.from(customerTicketPages, CustomerTicketResponseDto::from);
	
}

public TicketResponseDto getTicketById(Long ticketId) {
	
	Ticket ticket = applicationUtils.getTicketById(ticketId);
	
	Long userId = applicationUtils.getCurrentAuthUser().getId();
	Role role = applicationUtils.getCurrentAuthUser().getRole();
	
	if (role == Role.CUSTOMER) {
		if (!Objects.equals(ticket.getCreatedBy().getId(), userId)) {
			throw new ResourceNotFoundException("Ticket not found");
		}
		return CustomerTicketResponseDto.from(ticket);
	}
	
	if (role == Role.AGENT) {
		if (ticket.getAssignedTo() == null ||
				    !Objects.equals(ticket.getAssignedTo().getId(), userId)) {
			throw new ResourceNotFoundException("Ticket not found");
		}
		return StaffTicketResponseDto.from(ticket);
	}
	
	// ADMIN — full access, no ownership check
	return StaffTicketResponseDto.from(ticket);
}


public StaffTicketResponseDto assignTicketToAgent(Long ticketId, AssignTicketRequestDto request) {
	
	Ticket ticket = applicationUtils.getTicketById(ticketId);
	
	User agent = userRepository.findById(request.agentId()).orElseThrow(
			() -> new ResourceNotFoundException("Agent not found")
	);
	
	TicketStatus ticketStatus = ticket.getStatus();
	Role role = agent.getRole();
	
	if (role != Role.AGENT) {
		throw new ResourceNotFoundException("Agent not found");
	}
	if (ticketStatus == TicketStatus.CLOSED || ticketStatus == TicketStatus.RESOLVED) {
		throw new InvalidStateTransitionException("Cannot assign or reassign a resolved or closed ticket");
	}
	if (ticketStatus == TicketStatus.ASSIGNED ||
			    ticketStatus == TicketStatus.IN_PROGRESS ||
			    ticketStatus == TicketStatus.WAITING_FOR_CUSTOMER) {
		
		ticket.setAssignedTo(agent);
		return StaffTicketResponseDto.from(ticketRepository.save(ticket));
	}
	
	ticket.setAssignedTo(agent);
	ticket.setStatus(TicketStatus.ASSIGNED);
	
	return StaffTicketResponseDto.from(ticketRepository.save(ticket));
}

public StaffTicketResponseDto updateStatus(Long ticketId, UpdateTicketStatusRequestDto request) {
	Ticket ticket = applicationUtils.getTicketById(ticketId);
	
	User actor = applicationUtils.getCurrentAuthUser();
	
	
	if (actor.getRole() == Role.AGENT &&
			    (ticket.getAssignedTo() == null || !Objects.equals(ticket.getAssignedTo().getId(), actor.getId()))) {
		throw new ResourceNotFoundException("Ticket not found");
	}
	
	TicketStatus current = ticket.getStatus();
	TicketStatus target = request.status();
	
	if (!current.canTransitionTo(target)) {
		throw new InvalidStateTransitionException(
				"Cannot move ticket from " + current + " to " + target);
	}
	
	ticket.setStatus(target);
	if (target == TicketStatus.RESOLVED) {
		ticket.setResolvedAt(OffsetDateTime.now());
	}
	
	return StaffTicketResponseDto.from(ticketRepository.save(ticket));
}

public CustomerTicketResponseDto closeTicket(Long ticketId) {
	Ticket ticket = applicationUtils.getTicketById(ticketId);
	
	if (!Objects.equals(ticket.getCreatedBy().getId(), applicationUtils.getCurrentAuthUser().getId())) {
		throw new ResourceNotFoundException("Ticket not found");
	}
	if (ticket.getStatus() != TicketStatus.RESOLVED) {
		throw new InvalidStateTransitionException(
				"Cannot close ticket from status " + ticket.getStatus());
	}
	
	ticket.setStatus(TicketStatus.CLOSED);
	ticket.setClosedAt(OffsetDateTime.now());
	
	return CustomerTicketResponseDto.from(ticketRepository.save(ticket));
}


public CustomerTicketResponseDto reopenTicket(Long ticketId) {
	Ticket ticket = applicationUtils.getTicketById(ticketId);
	
	if (!Objects.equals(ticket.getCreatedBy().getId(), applicationUtils.getCurrentAuthUser().getId())) {
		throw new ResourceNotFoundException("Ticket not found");
	}

	if (ticket.getStatus() != TicketStatus.RESOLVED) {
		throw new InvalidStateTransitionException(
				"Cannot reopen ticket from status " + ticket.getStatus());
	}
	
	ticket.setStatus(TicketStatus.IN_PROGRESS);
	
	return CustomerTicketResponseDto.from(ticketRepository.save(ticket));
}


public StaffTicketResponseDto updatePriority(Long ticketId, UpdateTicketPriorityRequestDto request) {
	Ticket ticket = applicationUtils.getTicketById(ticketId);
	
	Long userId = applicationUtils.getCurrentAuthUser().getId();
	
	if (applicationUtils.getCurrentAuthUser().getRole() == Role.AGENT
			    && (ticket.getAssignedTo() == null
					        || !Objects.equals(ticket.getAssignedTo().getId(), userId))) {
		
		throw new ResourceNotFoundException("Ticket not found");
	}
	
	ticket.setPriority(request.priority());
	
	return StaffTicketResponseDto.from(ticketRepository.save(ticket));
	
}

}
