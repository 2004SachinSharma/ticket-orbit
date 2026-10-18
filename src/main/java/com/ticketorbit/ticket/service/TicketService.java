package com.ticketorbit.ticket.service;

import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.category.entity.Category;
import com.ticketorbit.category.repository.CategoryRepository;
import com.ticketorbit.ticket.dto.CreateTicketRequestDto;
import com.ticketorbit.ticket.dto.CustomerTicketResponseDto;
import com.ticketorbit.ticket.dto.PageResponseDto;
import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.ticket.repository.TicketRepository;
import com.ticketorbit.ticket.ticket_enum.SlaState;
import com.ticketorbit.ticket.ticket_enum.TicketStatus;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
	
	Page<Ticket> ticketPages = ticketRepository.findAllByCreatedBy(currentUser(), pageRequest );
	
	return PageResponseDto.from(ticketPages);
	
}

public CustomerTicketResponseDto getTicketById(long ticketId) {

	Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
			() -> new ResourceNotFoundException("Ticket not found"));
	
	Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	Long userId = Long.valueOf(authentication.getPrincipal().toString());
	
	if(!ticket.getCreatedBy().getId().equals(userId)) {
		throw new ResourceNotFoundException("Ticket not found");
	}
	
	
 return CustomerTicketResponseDto.from(ticket);
}

private User currentUser() {
	Long userId = Long.valueOf(SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
	return userRepository.findById(userId)
			       .orElseThrow(() -> new ResourceNotFoundException("User not found"));
}

}
