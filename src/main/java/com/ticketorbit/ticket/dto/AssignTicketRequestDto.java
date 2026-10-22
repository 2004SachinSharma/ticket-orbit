package com.ticketorbit.ticket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AssignTicketRequestDto(
        @NotNull(message = "Agent ID is required")
        @Positive(message = "Agent ID must be positive")
        Long agentId) {}
