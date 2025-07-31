package com.example.workmanagementbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "phone")
    private String phone;

    @Column(name = "location")
    private String location;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "department")
    private String department;

    @Column(name = "position")
    private String position;

    @Column(name = "join_date")
    private String joinDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserRole role = UserRole.MEMBER;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum UserRole {
        ADMIN, MANAGER, MEMBER, VIEWER
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}