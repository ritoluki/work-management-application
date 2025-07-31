package com.example.workmanagementbackend.dto;

import com.example.workmanagementbackend.entity.Notification.NotificationType;
import com.example.workmanagementbackend.entity.Notification.RelatedEntityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    
    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private RelatedEntityType relatedEntityType;
    private Long relatedEntityId;
    private LocalDateTime createdAt;
    private Long createdById;
    private String metadata;
    
    // Additional fields for frontend
    private String createdByName;
    private String relatedEntityName;
    
    // Constructor for creating new notifications
    public static NotificationDTO create(Long userId, NotificationType type, String title, String message) {
        return NotificationDTO.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }
    
    // Factory methods for common notification types
    public static NotificationDTO taskAssigned(Long userId, String taskName, String assignerName, Long taskId) {
        return create(userId, NotificationType.TASK_ASSIGNED, 
                     "Task được giao", 
                     assignerName + " đã giao cho bạn task \"" + taskName + "\"")
                .toBuilder()
                .relatedEntityType(RelatedEntityType.TASK)
                .relatedEntityId(taskId)
                .build();
    }
    
    public static NotificationDTO commentAdded(Long userId, String taskName, String commenterName, Long taskId) {
        return create(userId, NotificationType.COMMENT_ADDED,
                     "Bình luận mới",
                     commenterName + " đã bình luận trên task \"" + taskName + "\"")
                .toBuilder()
                .relatedEntityType(RelatedEntityType.TASK)
                .relatedEntityId(taskId)
                .build();
    }
    
    public static NotificationDTO deadlineWarning(Long userId, String taskName, String timeRemaining, Long taskId) {
        return create(userId, NotificationType.DEADLINE_WARNING,
                     "Cảnh báo deadline",
                     "Task \"" + taskName + "\" sẽ đến hạn trong " + timeRemaining)
                .toBuilder()
                .relatedEntityType(RelatedEntityType.TASK)
                .relatedEntityId(taskId)
                .build();
    }
    
    public static NotificationDTO boardCreated(Long userId, String boardName, String creatorName, Long boardId) {
        return create(userId, NotificationType.BOARD_CREATED,
                     "Board mới",
                     creatorName + " đã tạo board \"" + boardName + "\"")
                .toBuilder()
                .relatedEntityType(RelatedEntityType.BOARD)
                .relatedEntityId(boardId)
                .build();
    }
    
    public static NotificationDTO userJoined(Long userId, String userName, String workspaceName, Long workspaceId) {
        return create(userId, NotificationType.USER_JOINED,
                     "Thành viên mới",
                     userName + " đã tham gia workspace \"" + workspaceName + "\"")
                .toBuilder()
                .relatedEntityType(RelatedEntityType.WORKSPACE)
                .relatedEntityId(workspaceId)
                .build();
    }
}
