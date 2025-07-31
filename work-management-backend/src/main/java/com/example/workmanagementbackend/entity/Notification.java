package com.example.workmanagementbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "related_entity_type", length = 50)
    @Enumerated(EnumType.STRING)
    private RelatedEntityType relatedEntityType;
    
    @Column(name = "related_entity_id")
    private Long relatedEntityId;
    
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "created_by_id")
    private Long createdById;
    
    // Additional metadata as JSON
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    public enum NotificationType {
        TASK_ASSIGNED,
        TASK_UPDATED,
        TASK_COMPLETED,
        TASK_OVERDUE,
        COMMENT_ADDED,
        DEADLINE_WARNING,
        BOARD_CREATED,
        BOARD_UPDATED,
        GROUP_CREATED,
        USER_JOINED,
        USER_LEFT,
        WORKSPACE_CREATED,
        MENTION
    }
    
    public enum RelatedEntityType {
        TASK,
        BOARD,
        GROUP,
        WORKSPACE,
        USER,
        COMMENT
    }
}
