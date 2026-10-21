package com.ticketorbit.ticket.entity;

import com.ticketorbit.ticket.ticket_enum.TicketMessageType;
import com.ticketorbit.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "ticket_messages")
public class TicketMessage {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id", nullable = false)
private Long id;

@NotNull
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "ticket_id", nullable = false)
private Ticket ticket;

@NotNull
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "sender_id", nullable = false)
private User sender;

@NotNull
@Column(name = "body", nullable = false, length = Integer.MAX_VALUE)
private String body;

@NotNull
@Column(name = "type", nullable = false, length = 20)
@Enumerated(EnumType.STRING)
private TicketMessageType type;

@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private OffsetDateTime createdAt;


}