package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.ticket.ticket_enum.SlaState;
import com.ticketorbit.ticket.ticket_enum.TicketPriority;
import com.ticketorbit.ticket.ticket_enum.TicketStatus;
import jakarta.annotation.Nullable;

import java.time.OffsetDateTime;

public record StaffTicketResponseDto(
		Long id,
		String subject,
		String description,
		String categoryName,
		TicketPriority priority,
		TicketStatus status,
		String createdByName,
		@Nullable String assignedToName,
		SlaState slaState,
		@Nullable OffsetDateTime slaDueAt,
		long version,
		OffsetDateTime createdAt,
		OffsetDateTime updatedAt
) implements TicketResponseDto {

public static StaffTicketResponseDto from(Ticket ticketResponse) {
	return new StaffTicketResponseDto(
			ticketResponse.getId(),
			ticketResponse.getSubject(),
			ticketResponse.getDescription(),
			ticketResponse.getCategory().getName(),
			ticketResponse.getPriority(),
			ticketResponse.getStatus(),
			ticketResponse.getCreatedBy().getName(),
			ticketResponse.getAssignedTo() != null ? ticketResponse.getAssignedTo().getName() : null,
			ticketResponse.getSlaState(),
			ticketResponse.getSlaDueAt(),
			ticketResponse.getVersion(),
			ticketResponse.getCreatedAt(),
			ticketResponse.getUpdatedAt()
	);
}
}