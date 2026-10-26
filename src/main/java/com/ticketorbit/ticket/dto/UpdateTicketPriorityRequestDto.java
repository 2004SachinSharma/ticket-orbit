package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.ticket_enum.TicketPriority;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketPriorityRequestDto(
		@NotNull(message = "Priority cannot be null")
		TicketPriority priority) {
}
