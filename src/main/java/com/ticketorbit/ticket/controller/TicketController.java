package com.ticketorbit.ticket.controller;

import com.ticketorbit.ticket.dto.*;
import com.ticketorbit.ticket.service.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tickets")
public class TicketController {

private final TicketService ticketService;

@PostMapping()
ResponseEntity<CustomerTicketResponseDto> createTicket(@Valid @RequestBody CreateTicketRequestDto createTicketRequestDto) {
return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(createTicketRequestDto));
}

@GetMapping()
ResponseEntity<PageResponseDto> getTicketsWithSortingAndpagination(@RequestParam(defaultValue = "createdAt", name="sortBy") String sortBy,
                                                                          @RequestParam(defaultValue = "asc", name="sortDir") String sortDir,
                                                                          @RequestParam(defaultValue = "0", name="pageNumber") int pageNumber,
                                                                          @RequestParam(defaultValue = "3", name="pageSize") int pageSize){
	return ResponseEntity.ok(ticketService.getTickets(sortBy, sortDir, pageNumber, pageSize));
}


@GetMapping("/{ticketId}")
public ResponseEntity<TicketResponseDto> getTicketById(
		@PathVariable Long ticketId) {
	return ResponseEntity.ok(ticketService.getTicketById(ticketId));

}

@PreAuthorize("hasAuthority('ROLE_ADMIN')") /* TODO: Will configure pagination for it soon */
@PatchMapping("/{ticketId}/assign")
public ResponseEntity<StaffTicketResponseDto> updateTicket(@PathVariable @NotNull(message = "Id cannot be null") @Positive(message = "Ticket Id must be positive")
                                                              Long ticketId,
                                                              @RequestBody @Valid
                                                              AssignTicketRequestDto assignTicketRequestDto) {
	return ResponseEntity.ok(ticketService.assignTicketToAgent(ticketId,assignTicketRequestDto));
}

@PreAuthorize("hasAnyAuthority('ROLE_AGENT','ROLE_ADMIN')")
@PatchMapping("/{ticketId}/status")
public ResponseEntity<StaffTicketResponseDto> updateStatus(
		@PathVariable @NotNull(message = "Id cannot be null") @Positive(message = "Ticket Id must be positive") Long ticketId,
		@RequestBody @Valid UpdateTicketStatusRequestDto request) {
	
	return ResponseEntity.ok(ticketService.updateStatus(ticketId, request));
}

@PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
@PostMapping("/{ticketId}/close")
public ResponseEntity<CustomerTicketResponseDto> closeTicket(
		@PathVariable @NotNull(message = "Id cannot be null") @Positive(message = "Ticket Id must be positive") Long ticketId) {
	
	return ResponseEntity.ok(ticketService.closeTicket(ticketId));
}

@PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
@PostMapping("/{ticketId}/reopen")
public ResponseEntity<CustomerTicketResponseDto> reopenTicket(
		@PathVariable @NotNull(message = "Id cannot be null") @Positive(message = "Ticket Id must be positive") Long ticketId) {
	
	return ResponseEntity.ok(ticketService.reopenTicket(ticketId));
}

@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_AGENT')")
@PatchMapping("/{ticketId}/priority")
ResponseEntity<StaffTicketResponseDto> updateTicketPriority( @PathVariable
                                                             @Positive(message = "Ticket Id must be positive")
                                                             @NotNull(message = "Id cannot be null")
                                                             Long ticketId,
                                                             @RequestBody
                                                             @Valid
                                                             UpdateTicketPriorityRequestDto request) {
    
	return ResponseEntity.ok(	ticketService.updatePriority(ticketId,request));
}
}
