package com.example.workmanagementbackend.controller;

import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        try {
            User updatedUser = userService.updateUserProfile(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Inner class for role update request
    public static class RoleUpdateRequest {
        private String role;
        
        public String getRole() {
            return role;
        }
        
        public void setRole(String role) {
            this.role = role;
        }
    }

    // Inner class for user profile update request
    public static class UpdateUserRequest {
        private String name;
        private String email;
        private String phone;
        private String location;
        private String bio;
        private String department;
        private String position;
        private String joinDate;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getJoinDate() { return joinDate; }
        public void setJoinDate(String joinDate) { this.joinDate = joinDate; }
    }
}
