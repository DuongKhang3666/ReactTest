package com.example.backend.controller;

import com.example.backend.dto.user.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
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
}