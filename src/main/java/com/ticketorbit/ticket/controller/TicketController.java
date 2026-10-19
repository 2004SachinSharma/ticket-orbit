package com.ticketorbit.ticket.controller;

import com.ticketorbit.ticket.dto.CreateTicketRequestDto;
import com.ticketorbit.ticket.dto.CustomerTicketResponseDto;
import com.ticketorbit.ticket.dto.PageResponseDto;
import com.ticketorbit.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


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
ResponseEntity<PageResponseDto> getTicketWithSortingAndpagination(@RequestParam(defaultValue = "createdAt", name="sortBy") String sortBy,
                                                                          @RequestParam(defaultValue = "asc", name="sortDir") String sortDir,
                                                                          @RequestParam(defaultValue = "0", name="pageNumber") int pageNumber,
                                                                          @RequestParam(defaultValue = "3", name="pageSize") int pageSize){
	return ResponseEntity.ok(ticketService.getTickets(sortBy, sortDir, pageNumber, pageSize));
}


@GetMapping("/{ticketId}")
public ResponseEntity<CustomerTicketResponseDto> getTicketById(
		@PathVariable Long ticketId) {
	return ResponseEntity.ok(ticketService.getTicketById(ticketId));
}

}
