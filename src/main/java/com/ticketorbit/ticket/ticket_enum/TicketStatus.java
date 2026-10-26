package com.ticketorbit.ticket.ticket_enum;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum TicketStatus {
	OPEN,
	ASSIGNED,
	IN_PROGRESS,
	WAITING_FOR_CUSTOMER,
	RESOLVED,
	CLOSED;
private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(TicketStatus.class);

static {
	ALLOWED_TRANSITIONS.put(OPEN, EnumSet.of(ASSIGNED));
	ALLOWED_TRANSITIONS.put(ASSIGNED, EnumSet.of(IN_PROGRESS));
	ALLOWED_TRANSITIONS.put(IN_PROGRESS, EnumSet.of(WAITING_FOR_CUSTOMER, RESOLVED));
	ALLOWED_TRANSITIONS.put(WAITING_FOR_CUSTOMER, EnumSet.of(IN_PROGRESS));
	ALLOWED_TRANSITIONS.put(RESOLVED, EnumSet.of(CLOSED, IN_PROGRESS));
	ALLOWED_TRANSITIONS.put(CLOSED, EnumSet.noneOf(TicketStatus.class));
}

public boolean canTransitionTo(TicketStatus target) {
	return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
}
}
