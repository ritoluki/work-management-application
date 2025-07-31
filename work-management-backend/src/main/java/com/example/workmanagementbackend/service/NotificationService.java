package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.dto.NotificationDTO;
import com.example.workmanagementbackend.entity.Notification;
import com.example.workmanagementbackend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send a real-time notification to a specific user
     */
    @Transactional
    public NotificationDTO sendNotification(NotificationDTO notificationDTO) {
        try {
            // Save notification to database
            Notification notification = mapToEntity(notificationDTO);
            Notification savedNotification = notificationRepository.save(notification);
            
            NotificationDTO result = mapToDTO(savedNotification);
            
            // Send real-time notification via WebSocket  
            String notificationDestination = "/topic/notifications/" + notificationDTO.getUserId();
            log.info("Sending WebSocket notification to {}: {}", notificationDestination, result.getTitle());
            messagingTemplate.convertAndSend(notificationDestination, result);
            
            // Send updated unread count
            Long unreadCount = getUnreadCount(notificationDTO.getUserId());
            Map<String, Object> unreadCountMessage = Map.of("count", unreadCount);
            String countDestination = "/topic/unread-count/" + notificationDTO.getUserId();
            log.info("Sending WebSocket unread count to {}: {}", countDestination, unreadCountMessage);
            messagingTemplate.convertAndSend(countDestination, unreadCountMessage);
            
            log.info("Notification sent to user {}: {} (unread count: {})", 
                notificationDTO.getUserId(), notificationDTO.getTitle(), unreadCount);
            return result;
            
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", notificationDTO.getUserId(), e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get all notifications for a user with pagination
     */
    public Page<NotificationDTO> getNotificationsForUser(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::mapToDTO);
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get unread count for a user
     */
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * Mark notification as read
     */
    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId);
        if (updated > 0) {
            // Send updated count via WebSocket
            sendUnreadCountUpdate(userId);
            return true;
        }
        return false;
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        int updated = notificationRepository.markAllAsRead(userId);
        if (updated > 0) {
            // Send updated count via WebSocket
            sendUnreadCountUpdate(userId);
        }
        return updated;
    }
    
    /**
     * Delete all notifications for a user
     */
    @Transactional
    public int deleteAllNotifications(Long userId) {
        return notificationRepository.deleteAllByUserId(userId);
    }
    
    /**
     * Send unread count update via WebSocket
     */
    private void sendUnreadCountUpdate(Long userId) {
        Long unreadCount = getUnreadCount(userId);
        String destination = "/user/" + userId + "/queue/unread-count";
        messagingTemplate.convertAndSend(destination, unreadCount);
    }
    
    /**
     * Clean up old notifications (called by scheduled task)
     */
    @Transactional
    public int cleanupOldNotifications(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        return notificationRepository.deleteOldNotifications(cutoffDate);
    }
    
    // Helper methods for factory pattern notifications
    
    public NotificationDTO sendTaskAssignedNotification(Long userId, String taskName, String assignerName, Long taskId) {
        NotificationDTO notification = NotificationDTO.taskAssigned(userId, taskName, assignerName, taskId);
        return sendNotification(notification);
    }
    
    public NotificationDTO sendCommentAddedNotification(Long userId, String taskName, String commenterName, Long taskId) {
        NotificationDTO notification = NotificationDTO.commentAdded(userId, taskName, commenterName, taskId);
        return sendNotification(notification);
    }
    
    public NotificationDTO sendDeadlineWarningNotification(Long userId, String taskName, String timeRemaining, Long taskId) {
        NotificationDTO notification = NotificationDTO.deadlineWarning(userId, taskName, timeRemaining, taskId);
        return sendNotification(notification);
    }
    
    public NotificationDTO sendBoardCreatedNotification(Long userId, String boardName, String creatorName, Long boardId) {
        NotificationDTO notification = NotificationDTO.boardCreated(userId, boardName, creatorName, boardId);
        return sendNotification(notification);
    }
    
    public NotificationDTO sendUserJoinedNotification(Long userId, String userName, String workspaceName, Long workspaceId) {
        NotificationDTO notification = NotificationDTO.userJoined(userId, userName, workspaceName, workspaceId);
        return sendNotification(notification);
    }
    
    // Mapping methods
    
    private Notification mapToEntity(NotificationDTO dto) {
        return Notification.builder()
                .id(dto.getId())
                .userId(dto.getUserId())
                .type(dto.getType())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .isRead(dto.getIsRead() != null ? dto.getIsRead() : false)
                .relatedEntityType(dto.getRelatedEntityType())
                .relatedEntityId(dto.getRelatedEntityId())
                .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now())
                .createdById(dto.getCreatedById())
                .metadata(dto.getMetadata())
                .build();
    }
    
    private NotificationDTO mapToDTO(Notification entity) {
        return NotificationDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .isRead(entity.getIsRead())
                .relatedEntityType(entity.getRelatedEntityType())
                .relatedEntityId(entity.getRelatedEntityId())
                .createdAt(entity.getCreatedAt())
                .createdById(entity.getCreatedById())
                .metadata(entity.getMetadata())
                .build();
    }
    
    /**
     * Get total notification count for testing database connection
     */
    public Long getTotalNotificationCount() {
        return notificationRepository.count();
    }
    
    /**
     * Create detailed task notification with workspace, board, group information
     */
    @Transactional
    public NotificationDTO sendTaskNotification(NotificationDTO baseNotification, 
                                              String taskName, 
                                              String dueDate,
                                              String workspaceName, 
                                              String boardName, 
                                              String groupName,
                                              String assignedBy) {
        try {
            // Create detailed message
            String detailedMessage = createDetailedTaskMessage(
                baseNotification.getType(), 
                taskName, 
                dueDate, 
                workspaceName, 
                boardName, 
                groupName, 
                assignedBy
            );
            
            // Create task details metadata
            String taskDetailsJson = String.format(
                "{\"taskName\":\"%s\",\"dueDate\":\"%s\",\"workspaceName\":\"%s\",\"boardName\":\"%s\",\"groupName\":\"%s\",\"assignedBy\":\"%s\"}",
                taskName != null ? taskName : "",
                dueDate != null ? dueDate : "",
                workspaceName != null ? workspaceName : "",
                boardName != null ? boardName : "",
                groupName != null ? groupName : "",
                assignedBy != null ? assignedBy : ""
            );
            
            // Update notification with detailed information
            baseNotification.setMessage(detailedMessage);
            baseNotification.setMetadata(taskDetailsJson);
            
            // Send the detailed notification
            return sendNotification(baseNotification);
            
        } catch (Exception e) {
            log.error("Error sending detailed task notification: {}", e.getMessage(), e);
            // Fallback to basic notification
            return sendNotification(baseNotification);
        }
    }
    
    /**
     * Create detailed message for task notifications
     */
    private String createDetailedTaskMessage(Notification.NotificationType type, 
                                           String taskName, 
                                           String dueDate, 
                                           String workspaceName, 
                                           String boardName, 
                                           String groupName, 
                                           String assignedBy) {
        switch (type) {
            case TASK_ASSIGNED:
                return String.format(
                    "Bạn vừa được %s giao task \"%s\" (hạn: %s) trong workspace \"%s\" > board \"%s\" > group \"%s\"",
                    assignedBy != null ? assignedBy : "Admin",
                    taskName,
                    dueDate != null ? dueDate : "chưa xác định",
                    workspaceName,
                    boardName,
                    groupName
                );
            case TASK_UPDATED:
                return String.format(
                    "Task \"%s\" đã được %s cập nhật trong workspace \"%s\" > board \"%s\" > group \"%s\"",
                    taskName,
                    assignedBy != null ? assignedBy : "Admin",
                    workspaceName,
                    boardName,
                    groupName
                );
            case TASK_COMPLETED:
                return String.format(
                    "Task \"%s\" đã được hoàn thành trong workspace \"%s\" > board \"%s\" > group \"%s\"",
                    taskName,
                    workspaceName,
                    boardName,
                    groupName
                );
            case DEADLINE_WARNING:
                return String.format(
                    "Task \"%s\" sẽ đến hạn (%s) trong workspace \"%s\" > board \"%s\" > group \"%s\"",
                    taskName,
                    dueDate != null ? dueDate : "sớm",
                    workspaceName,
                    boardName,
                    groupName
                );
            default:
                return String.format(
                    "Task \"%s\" có cập nhật mới trong workspace \"%s\" > board \"%s\" > group \"%s\"",
                    taskName,
                    workspaceName,
                    boardName,
                    groupName
                );
        }
    }
}
