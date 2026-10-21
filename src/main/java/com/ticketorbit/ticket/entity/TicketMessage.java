package com.ticketorbit.ticket.entity;

@lombok.Getter
@lombok.Setter@jakarta.persistence.Entity
@jakarta.persistence.Table(name = "ticket_messages")
public class TicketMessage {
@jakarta.persistence.Id
@jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
@jakarta.persistence.Column(name = "id", nullable = false)
private java.lang.Long id;

@jakarta.validation.constraints.NotNull
@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
@jakarta.persistence.JoinColumn(name = "ticket_id", nullable = false)
private com.ticketorbit.ticket.entity.Ticket ticket;

@jakarta.validation.constraints.NotNull
@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
@jakarta.persistence.JoinColumn(name = "sender_id", nullable = false)
private com.ticketorbit.user.entity.User sender;

@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "body", nullable = false, length = Integer.MAX_VALUE)
private java.lang.String body;

@jakarta.validation.constraints.Size(max = 20)
@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "type", nullable = false, length = 20)
private java.lang.String type;

@jakarta.validation.constraints.NotNull
@org.hibernate.annotations.ColumnDefault("CURRENT_TIMESTAMP")
@jakarta.persistence.Column(name = "created_at", nullable = false)
private java.time.OffsetDateTime createdAt;



}