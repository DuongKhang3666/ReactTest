package com.example.backend.service;

import com.example.backend.enums.Role;
import com.example.backend.dto.user.ChangePasswordRequest;
import com.example.backend.dto.user.UpdateUserRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng có mã: " + id)
                );
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng có tên đăng nhập: " + username)
                );
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng có email: " + email)
                );
    }

    public User updateUser(Long id, UpdateUserRequest request) {
        User existingUser = getUserById(id);

        if(!existingUser.getUsername().equals(request.username()) && existsByUsername(request.username())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại: " + request.username());
        }

        if(!existingUser.getEmail().equals(request.email()) && existsByEmail(request.email())) {
            throw new RuntimeException("Email đã tồn tại: " + request.email());
        }

        existingUser.setUsername(request.username());
        existingUser.setEmail(request.email());
        existingUser.setFullName(request.fullName());
        existingUser.setPhone(request.phone());


        User savedUser = userRepository.save(existingUser);
        return userRepository.findById(savedUser.getId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng có mã: " + id)
                );
    }

    public Boolean updatePassword(
            Long userId,
            ChangePasswordRequest request
    ) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        // Tìm người dùng hiện tại
        User user = getUserById(userId);

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPasswordHash()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mật khẩu hiện tại không chính xác"
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPasswordHash()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mật khẩu mới phải khác mật khẩu hiện tại"
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(request.newPassword())
        );

        User updatedUser = userRepository.save(user);
        return updatedUser != null;
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User updateUserRole(Long id, Role role) {
        User user = getUserById(id);

        user.setRole(role);

        return userRepository.save(user);
    }
}