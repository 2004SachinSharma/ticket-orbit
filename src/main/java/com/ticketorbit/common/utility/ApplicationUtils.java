package com.ticketorbit.common.utility;

import com.ticketorbit.auth.exception.ResourceNotFoundException;
import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.ticket.repository.TicketRepository;
import com.ticketorbit.user.entity.User;
import com.ticketorbit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ApplicationUtils {

private final UserRepository userRepository;
private final TicketRepository ticketRepository;

public User getCurrentAuthUser() {
	Long userId = Long.valueOf(
			SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString()
	);
	return userRepository.findById(userId)
			       .orElseThrow(() -> new ResourceNotFoundException("User not found"));
}

public Ticket getTicketById(long ticketId){
return ticketRepository.findById(ticketId)
			                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

}
}