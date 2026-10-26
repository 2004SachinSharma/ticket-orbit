package com.ticketorbit.ticket.dto;

import com.ticketorbit.ticket.entity.Ticket;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public record PageResponseDto<T>(
    List<T> content,
    int pageNumber,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean last
) {
    public static <E, T> PageResponseDto<T> from(Page<E> page, Function<E, T> mapper) {
        
      return  new PageResponseDto<>(
                page.getContent().stream().map(mapper).collect(Collectors.toList()),/*TODO: Eliminate CustomerTicketResponseDto to service layer, out of this dto record, */
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}