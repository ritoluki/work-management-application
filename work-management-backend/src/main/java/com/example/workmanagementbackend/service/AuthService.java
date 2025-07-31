package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Kiểm tra password (tạm thời so sánh trực tiếp)
            if (password.equals(user.getPasswordHash())) {
                return Optional.of(user);
            }
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
        user.setPasswordHash(password); // Trong thực tế sẽ hash password
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
            
            // Kiểm tra mật khẩu hiện tại
            if (currentPassword.equals(user.getPasswordHash())) {
                // Cập nhật mật khẩu mới (trong thực tế sẽ hash password)
                user.setPasswordHash(newPassword);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
}