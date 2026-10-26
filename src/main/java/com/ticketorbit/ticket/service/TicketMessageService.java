package com.ticketorbit.ticket.service;

import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.ticket.dto.TicketMessageRequestDto;
import com.ticketorbit.ticket.dto.TicketMessageResponseDto;
import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.ticket.entity.TicketMessage;
import com.ticketorbit.ticket.repository.TicketMessageRepository;
import com.ticketorbit.ticket.repository.TicketRepository;
import com.ticketorbit.ticket.ticket_enum.TicketMessageType;
import com.ticketorbit.ticket.ticket_enum.TicketStatus;
import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketMessageService {

private final TicketMessageRepository ticketMessageRepository;
private final TicketRepository ticketRepository;
private final UserRepository userRepository;

public TicketMessageResponseDto sendMessage(Long ticketId, TicketMessageRequestDto request) {
	
	Ticket ticket = ticketRepository.findById(ticketId)
			                .orElseThrow(() ->
					                             new ResourceNotFoundException("Ticket not found"));
	
	// Get the authenticated user's ID from the JWT security context.
	Authentication authentication =
			SecurityContextHolder.getContext().getAuthentication();
	
	Long userId = Long.valueOf(authentication.getPrincipal().toString());
	
	User sender = userRepository.findById(userId)
			              .orElseThrow(() ->
					                           new ResourceNotFoundException("User not found"));
	
	Role role = sender.getRole();
	
	// CUSTOMER can access only their own ticket.
	if (role == Role.CUSTOMER &&
			    !Objects.equals(ticket.getCreatedBy().getId(), userId)) {
		throw new ResourceNotFoundException("Ticket not found");
	}
	
	// AGENT can access only tickets assigned to them.
	if (role == Role.AGENT &&
			    (ticket.getAssignedTo() == null ||
					     !Objects.equals(ticket.getAssignedTo().getId(), userId))) {
		throw new ResourceNotFoundException("Ticket not found");
	}
	
	// Customers cannot create internal notes.
	if (request.type() == TicketMessageType.INTERNAL_NOTE &&
			    role == Role.CUSTOMER) {
		throw new AccessDeniedException(
				"Customers cannot create internal notes");
	}
 
	//As soon the customer messages in WAITING_FOR_CUSTOMER status, the ticket out of WAITING_FOR_CUSTOMER back into IN_PROGRESS.
	if (role == Role.CUSTOMER && ticket.getStatus() == TicketStatus.WAITING_FOR_CUSTOMER) {
		ticket.setStatus(TicketStatus.IN_PROGRESS);
		ticketRepository.save(ticket);
	}
	
	TicketMessage message = new TicketMessage();
	message.setTicket(ticket);
	message.setSender(sender);
	message.setBody(request.body().trim());
	message.setType(request.type());
	TicketMessage ticketMessage = ticketMessageRepository.save(message);
	
	return TicketMessageResponseDto.from(ticketMessage);
}

@Transactional(readOnly = true)
public List<TicketMessageResponseDto> getMessages(Long ticketId) {
	// 1. Fetch ticket
	Ticket ticket = ticketRepository.findById(ticketId)
			                .orElseThrow(() ->
					                             new ResourceNotFoundException("Ticket not found"));
	
	Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	Long userId = Long.valueOf(authentication.getPrincipal().toString());
	User user = userRepository.findById(userId).orElseThrow(() ->
			                                                        new ResourceNotFoundException("Ticket not found"));
	
	
	if (user.getRole() == Role.CUSTOMER && !Objects.equals(ticket.getCreatedBy().getId(), user.getId())) {
		throw new ResourceNotFoundException("Ticket not found");
	}
	
	List<TicketMessage> ticketMessagesList = ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
	
	if (user.getRole() == Role.CUSTOMER) {
		return ticketMessagesList.stream()
				       .filter(message -> message.getType() == TicketMessageType.PUBLIC)
				       .map(TicketMessageResponseDto::from)
				       .collect(Collectors.toList());
		
	}
	
	
	// Agent receive public messages and internal notes, over a check.
	if (user.getRole() == Role.AGENT && (ticket.getAssignedTo() == null || !Objects.equals(ticket.getAssignedTo().getId(), user.getId()))) {
		throw new ResourceNotFoundException("Ticket not found");
	}
	
	//At Last Admin receive public messages and internal notes, no any check over the id.
	
	return ticketMessagesList.stream()
			       .map(TicketMessageResponseDto::from)
			       .collect(Collectors.toList());
	
}
}