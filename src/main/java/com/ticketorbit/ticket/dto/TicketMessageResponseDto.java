package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.entity.TicketMessage;
import com.ticketorbit.ticket.ticket_enum.TicketMessageType;

import java.time.OffsetDateTime;

public record TicketMessageResponseDto(
		Long id,
		Long senderId,
		String senderName,
		String body,
		TicketMessageType type,
		OffsetDateTime createdAt
) {
	public static TicketMessageResponseDto from(TicketMessage ticket){
		return new TicketMessageResponseDto(ticket.getId(), ticket.getSender().getId(), ticket.getSender().getName(), ticket.getBody(), ticket.getType(), ticket.getCreatedAt());
	}

}
