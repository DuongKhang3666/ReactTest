package com.example.backend.dto.user;

public record UpdateUserRequest(
        String username,
        String email,
        String fullName,
        String phone
) {
}