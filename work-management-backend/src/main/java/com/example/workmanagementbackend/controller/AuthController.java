package com.example.workmanagementbackend.controller;

import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest request) {
        Optional<User> user = authService.authenticate(request.getEmail(), request.getPassword());
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPassword()
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/current-user")
    public ResponseEntity<User> getCurrentUser() {
        User user = authService.getCurrentUser();
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            boolean success = authService.changePassword(
                request.getUserId(),
                request.getCurrentPassword(),
                request.getNewPassword()
            );

            if (success) {
                return ResponseEntity.ok("Password changed successfully");
            } else {
                return ResponseEntity.badRequest().body("Current password is incorrect");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to change password: " + e.getMessage());
        }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;

        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ChangePasswordRequest {
        private Long userId;
        private String currentPassword;
        private String newPassword;

        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}