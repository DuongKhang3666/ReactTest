package com.example.backend.exception;

public class SeatConflictException extends RuntimeException {

    public SeatConflictException(String message) {
        super(message);
    }

    public SeatConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
