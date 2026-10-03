package com.example.backend.exception;

import com.example.backend.dto.error.ConflictSeat;
import java.util.List;

public class SeatConflictException extends RuntimeException {
    private final List<ConflictSeat> conflictSeats;
    public SeatConflictException(String message, List<ConflictSeat> conflictSeats) {
        super(message);
        this.conflictSeats = List.copyOf(conflictSeats);
    }
    public List<ConflictSeat> getConflictSeats() { return conflictSeats; }
}
