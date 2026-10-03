package com.example.backend.dto.error;

import java.util.List;

public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,
        List<ConflictSeat> conflictSeats
) {
    public ErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, List.of());
    }
}