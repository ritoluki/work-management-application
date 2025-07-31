package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.repository.UserRepository;
import com.example.workmanagementbackend.controller.UserController.UpdateUserRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        // Generate avatar if not provided
        if (user.getAvatarUrl() == null || user.getAvatarUrl().trim().isEmpty()) {
            String avatar = generateAvatar(user.getFirstName(), user.getLastName());
            user.setAvatarUrl(avatar);
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setDescription(userDetails.getDescription());
        user.setAvatarUrl(userDetails.getAvatarUrl());

        return userRepository.save(user);
    }

    public User updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            user.setRole(User.UserRole.valueOf(role));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }

        return userRepository.save(user);
    }

    // Generate avatar from name
    private String generateAvatar(String firstName, String lastName) {
        if (firstName == null || firstName.trim().isEmpty()) {
            return "U";
        }
        
        String first = firstName.trim().substring(0, 1).toUpperCase();
        if (lastName != null && !lastName.trim().isEmpty()) {
            String last = lastName.trim().substring(0, 1).toUpperCase();
            return first + last;
        }
        
        // If only first name, take first 2 characters or just first if short
        if (firstName.trim().length() > 1) {
            return first + firstName.trim().substring(1, 2).toUpperCase();
        }
        
        return first;
    }

    public User updateUserProfile(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Parse name into firstName and lastName
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String[] nameParts = request.getName().trim().split("\\s+");
            if (nameParts.length > 0) {
                user.setFirstName(nameParts[0]);
                if (nameParts.length > 1) {
                    StringBuilder lastNameBuilder = new StringBuilder();
                    for (int i = 1; i < nameParts.length; i++) {
                        if (i > 1) lastNameBuilder.append(" ");
                        lastNameBuilder.append(nameParts[i]);
                    }
                    user.setLastName(lastNameBuilder.toString());
                } else {
                    user.setLastName("");
                }
                
                // Generate new avatar based on updated name
                String newAvatar = generateAvatar(user.getFirstName(), user.getLastName());
                user.setAvatarUrl(newAvatar);
            }
        }

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getPosition() != null) user.setPosition(request.getPosition());
        if (request.getJoinDate() != null) user.setJoinDate(request.getJoinDate());

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
