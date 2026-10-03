package com.example.backend.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PassengerDetails(
        @NotNull Long seatId,
        @NotBlank @Size(max = 120) String passengerName,
        @Size(max = 20) String passengerPhone
) {
}