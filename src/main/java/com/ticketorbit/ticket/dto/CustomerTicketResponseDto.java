package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.ticket.ticket_enum.TicketPriority;
import com.ticketorbit.ticket.ticket_enum.TicketStatus;

import java.time.OffsetDateTime;

public record CustomerTicketResponseDto(
        Long id,
        String subject,
        String description,
        String categoryName,
        TicketPriority priority,
        TicketStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) implements TicketResponseDto {
	
	public static CustomerTicketResponseDto from(Ticket ticketResponse) {
		return new CustomerTicketResponseDto(
				ticketResponse.getId(),
				ticketResponse.getSubject(),
				ticketResponse.getDescription(),
				ticketResponse.getCategory().getName(),
				ticketResponse.getPriority(),
				ticketResponse.getStatus(),
				ticketResponse.getCreatedAt(),
				ticketResponse.getUpdatedAt()
				);
		
	}
	
}

