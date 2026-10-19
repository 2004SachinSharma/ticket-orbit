package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.ticket_enum.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequestDto(
		@NotBlank(message = "Subject is required")
		@Size(max = 255, message = "Subject cannot exceed 255 characters")
		String subject,
		
		@NotBlank(message = "Description is required")
		String description,
		
		@NotNull(message = "Category is required")
		Long categoryId,
		
		@NotNull(message = "Priority is required")
		TicketPriority priority
		) {
}
