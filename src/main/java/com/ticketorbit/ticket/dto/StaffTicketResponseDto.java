package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.ticket_enum.SlaState;
import com.ticketorbit.ticket.ticket_enum.TicketPriority;
import com.ticketorbit.ticket.ticket_enum.TicketStatus;

import java.time.OffsetDateTime;

public record StaffTicketResponseDto(
		Long id,
		String subject,
		String description,
		String categoryName,
		TicketPriority priority,
		TicketStatus status,
		String createdByName,
		String assignedToName,   // nullable
		SlaState slaState,
		OffsetDateTime slaDueAt,
		long version,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
) {
}
