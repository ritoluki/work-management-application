package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPasswordHash();
            boolean matched = false;
            if (storedPassword != null) {
                boolean looksLikeBcrypt = storedPassword.startsWith("$2") && storedPassword.length() >= 60;
                if (looksLikeBcrypt) {
                    try {
                        matched = passwordEncoder.matches(password, storedPassword);
                    } catch (IllegalArgumentException ex) {
                        matched = false; // Fall back to plain compare below
                    }
                }
                if (!matched) {
                    matched = password.equals(storedPassword);
                }
            }
            if (matched) return Optional.of(user);
        }
        return Optional.empty();
    }

    public User register(String firstName, String lastName, String email, String password) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Tạo user mới
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(User.UserRole.MEMBER); // Mặc định role là MEMBER
        user.setIsActive(true);

        return userRepository.save(user);
    }

    public User getCurrentUser() {
        // Trong thực tế sẽ kiểm tra session/token
        // Hiện tại trả về null để yêu cầu đăng nhập thực sự
        return null;
    }

    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPasswordHash();
            boolean isBcrypt = storedPassword != null && storedPassword.startsWith("$2");
            boolean matched = isBcrypt
                    ? passwordEncoder.matches(currentPassword, storedPassword)
                    : currentPassword.equals(storedPassword);
            if (!matched) return false;

            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }
}