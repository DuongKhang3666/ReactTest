package com.example.backend.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateBookingRequest(
        @NotNull Long tripId,
        @NotNull @Size(min = 1) List<@NotNull Long> seatIds,
        @NotNull @Size(min = 1) List<@NotNull @Valid PassengerDetails> passengers
) {
}