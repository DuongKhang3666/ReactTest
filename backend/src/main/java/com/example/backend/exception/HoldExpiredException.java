package com.example.backend.exception;

public class HoldExpiredException extends RuntimeException {

    public HoldExpiredException(String message) {
        super(message);
    }

    public HoldExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
