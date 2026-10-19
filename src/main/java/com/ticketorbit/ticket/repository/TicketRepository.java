package com.ticketorbit.ticket.repository;

import com.ticketorbit.ticket.entity.Ticket;
import com.ticketorbit.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

public Ticket save(Ticket ticket);

@EntityGraph(attributePaths = {"category", "createdBy", "assignedTo"})
public Page<Ticket> findAllByCreatedBy(User user, Pageable pageRequest);

@EntityGraph(attributePaths = {"category", "createdBy", "assignedTo"})
public Optional<Ticket> findById(long id);
}
