package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.ticket_enum.TicketMessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketMessageRequestDto(
		@NotBlank(message="Body cannot be blank")
		String body,
		
		@NotNull(message = "Message type cannot be null")
		TicketMessageType type
) {

}
