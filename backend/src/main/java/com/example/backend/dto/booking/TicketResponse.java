package com.example.backend.dto.booking;

import com.example.backend.enums.TicketStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        Long seatId,
        String seatNumber,
        String passengerName,
        String passengerPhone,
        BigDecimal price,
        TicketStatus status,
        LocalDateTime cancelledAt
) {
}