package com.example.backend.controller;

import com.example.backend.dto.user.ChangePasswordRequest;
import com.example.backend.dto.user.UpdateUserRequest;
import com.example.backend.dto.user.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;

import jakarta.validation.Valid;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(
            Authentication authentication
    ) {
        Long userId = Long.valueOf(authentication.getName());

        User user = userService.getUserById(userId);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole()
        );
    }

    @PutMapping("/me/{id}")
    public UserResponse updateUser(
            Authentication authentication,
            @RequestBody UpdateUserRequest request,
            @PathVariable Long id
    ) {
        User user = userService.updateUser(id, request);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole()
        );
    }

    @PatchMapping("/me/{id}/password")
    public Map<String, String> updatePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request,
            @PathVariable Long id
    ) {
        Long userId = Long.valueOf(authentication.getName());

        userService.updatePassword(userId, request);

        return Map.of(
                "message",
                "Cập nhật mật khẩu thành công"
        );
    }
}