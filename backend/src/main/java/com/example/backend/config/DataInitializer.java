package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.enums.Role;
import com.example.backend.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            String adminUsername = "admin";

            // Kiểm tra tài khoản admin đã tồn tại chưa
            if (userRepository.findByUsername(adminUsername).isEmpty()) {

                User admin = new User(
                        adminUsername,
                        "admin123@gmail.com",
                        passwordEncoder.encode("123456"),
                        Role.ADMIN,
                        "System Administrator",
                        "0123456789"
                );

                userRepository.save(admin);

                System.out.println(
                        ">> Đã tạo tài khoản Admin mặc định thành công!"
                );
            }
        };
    }
}