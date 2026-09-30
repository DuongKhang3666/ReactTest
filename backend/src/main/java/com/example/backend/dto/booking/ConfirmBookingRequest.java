package com.example.backend.dto.booking;

import jakarta.validation.Valid;

import java.util.List;

public record ConfirmBookingRequest(@Valid List<PassengerDetails> passengers) {
}