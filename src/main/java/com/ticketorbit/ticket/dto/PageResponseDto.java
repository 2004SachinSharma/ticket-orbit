package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.entity.Ticket;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

public record PageResponseDto(
    List<CustomerTicketResponseDto> content,
    int pageNumber,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean last
) {
    public static PageResponseDto from(Page<Ticket> page) {
        
      return  new PageResponseDto(
                page.getContent().stream().map(CustomerTicketResponseDto::from).collect(Collectors.toList()),/*TODO: Eliminate CustomerTicketResponseDto to service layer, out of this dto record, */
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}