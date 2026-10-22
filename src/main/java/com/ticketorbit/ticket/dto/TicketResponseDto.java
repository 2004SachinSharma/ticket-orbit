package com.ticketorbit.ticket.dto;

public sealed interface TicketResponseDto permits CustomerTicketResponseDto, StaffTicketResponseDto {
}