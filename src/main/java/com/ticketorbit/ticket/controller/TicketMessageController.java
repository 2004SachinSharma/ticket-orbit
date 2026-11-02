package com.ticketorbit.ticket.controller;

import com.ticketorbit.ticket.dto.TicketMessageRequestDto;
import com.ticketorbit.ticket.dto.TicketMessageResponseDto;

import com.ticketorbit.ticket.service.TicketMessageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tickets")

public class TicketMessageController {
private final TicketMessageService ticketMessageService;

@GetMapping("/{ticketId}/messages")
ResponseEntity<List<TicketMessageResponseDto>> getTicketMessages(@PathVariable
                                                                 @NotNull(message = "Id cannot be null")
                                                                 @Positive(message = "Ticket Id must be positive")
                                                                 Long ticketId) {

return ResponseEntity.ok(ticketMessageService.getMessages(ticketId));
}


@PostMapping("/{ticketId}/messages")
ResponseEntity<TicketMessageResponseDto> saveTicketMessage(@PathVariable
                                                           @NotNull(message = "Id cannot be null")
                                                           @Positive(message = "Ticket Id must be positive")
                                                           Long ticketId,
                                                           
                                                           @RequestBody
                                                           @Valid
                                                           TicketMessageRequestDto ticketMessageRequestDto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ticketMessageService.sendMessage(ticketId,ticketMessageRequestDto));
}
}
