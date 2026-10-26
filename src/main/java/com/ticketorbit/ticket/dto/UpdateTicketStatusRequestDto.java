package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.ticket_enum.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketStatusRequestDto(
		@NotNull(message = "Status is required")
		TicketStatus status
) {}