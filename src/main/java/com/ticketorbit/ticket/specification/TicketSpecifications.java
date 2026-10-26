    package com.ticketorbit.ticket.specification;
    
    import com.ticketorbit.ticket.entity.Ticket;
    import com.ticketorbit.ticket.ticket_enum.TicketPriority;
    import com.ticketorbit.ticket.ticket_enum.TicketStatus;
    import com.ticketorbit.user.entity.User;
    import org.springframework.data.jpa.domain.Specification;
    
    public class TicketSpecifications {
    
    private TicketSpecifications() {} // utility class, no instances
    
    public static Specification<Ticket> hasStatus(TicketStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }
    
    public static Specification<Ticket> hasPriority(TicketPriority priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }
    
    public static Specification<Ticket> hasCategory(Long categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }
    
    // admin-only: filter by an arbitrary assignee id
    public static Specification<Ticket> isAssignedTo(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("assignedTo").get("id"), userId);
    }
    
    // role-scope predicates (not request filters) -- these fix the result set to "mine"
    public static Specification<Ticket> assignedTo(User user) {
        return (root, query, cb) -> cb.equal(root.get("assignedTo"), user);
    }
    
    public static Specification<Ticket> createdBy(User user) {
        return (root, query, cb) -> cb.equal(root.get("createdBy"), user);
    }
    }