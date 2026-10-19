package com.ticketorbit.ticket.entity;

import com.ticketorbit.category.entity.Category;
import com.ticketorbit.ticket.ticket_enum.SlaState;
import com.ticketorbit.ticket.ticket_enum.TicketPriority;
import com.ticketorbit.ticket.ticket_enum.TicketStatus;
import com.ticketorbit.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "tickets")
public class Ticket {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id", nullable = false)
private Long id;

@Size(max = 255)
@NotNull
@Column(name = "subject", nullable = false, length = 255)
private String subject;

@NotNull
@Column(name = "description", nullable = false, length = Integer.MAX_VALUE)
private String description;

@NotNull
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "category_id", nullable = false)
private Category category;

@NotNull
@Enumerated(EnumType.STRING)
@Column(name = "priority", nullable = false)
private TicketPriority priority;

@NotNull
@Enumerated(EnumType.STRING)
@Column(name = "status", nullable = false)
private TicketStatus status;

@NotNull
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "created_by", nullable = false)
private User createdBy;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "assigned_to")
private User assignedTo;

@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private OffsetDateTime createdAt;

@UpdateTimestamp
@Column(name = "updated_at", nullable = false)
private OffsetDateTime updatedAt;

@Column(name = "resolved_at")
private OffsetDateTime resolvedAt;

@Column(name = "closed_at")
private OffsetDateTime closedAt;

@Column(name = "sla_warn_at")
private OffsetDateTime slaWarnAt;

@Column(name = "sla_due_at")
private OffsetDateTime slaDueAt;

@NotNull
@ColumnDefault("'ON_TRACK'")
@Enumerated(EnumType.STRING)
@Column(name = "sla_state", nullable = false)
private SlaState slaState = SlaState.ON_TRACK;

@NotNull
@ColumnDefault("0")
@Version
@Column(name = "version", nullable = false)
private Long version;


}