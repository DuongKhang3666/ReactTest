package com.example.backend.dto.booking;

import com.example.backend.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingResponse(
        Long id,
        String bookingCode,
        Long tripId,
        BigDecimal totalAmount,
        BookingStatus status,
        LocalDateTime bookedAt,
        LocalDateTime cancelledAt,
        List<TicketResponse> tickets
) {
    @com.fasterxml.jackson.annotation.JsonProperty("message")
    public String message() {
        return switch (status) {
            case PENDING -> "Request received; awaiting admin confirmation. No official ticket yet.";
            case CONFIRMED -> "Booking confirmed by admin.";
            case CANCELLED -> "Booking cancelled.";
        };
    }
}