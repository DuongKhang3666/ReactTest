package com.example.backend.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateBookingRequest(
        @NotNull Long tripId,
        @NotNull Long seatId,
        @Size(max = 120) String passengerName,
        @Size(max = 20) String passengerPhone
) {
}