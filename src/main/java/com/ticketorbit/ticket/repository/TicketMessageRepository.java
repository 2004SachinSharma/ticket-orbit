package com.ticketorbit.ticket.repository;

import com.ticketorbit.ticket.entity.TicketMessage;
import com.ticketorbit.ticket.ticket_enum.TicketMessageType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketMessageRepository
		extends JpaRepository<TicketMessage, Long> {

List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
List<TicketMessage> findByTicketIdAndTypeOrderByCreatedAtAsc(Long ticketId, TicketMessageType type);

}