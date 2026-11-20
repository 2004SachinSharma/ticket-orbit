package com.ticketorbit.ticket.repository;

import com.ticketorbit.ticket.entity.TicketMessage;
import com.ticketorbit.ticket.ticket_enum.TicketMessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository
		extends JpaRepository<TicketMessage, Long> {

List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

}