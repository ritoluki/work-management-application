package com.example.workmanagementbackend.controller;

import com.example.workmanagementbackend.dto.NotificationDTO;
import com.example.workmanagementbackend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Get notifications for current user with pagination
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifications = notificationService.getNotificationsForUser(userId, pageable);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notifications for current user
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread count for current user
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * Mark notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Boolean>> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        
        boolean success = notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.ok(Map.of("success", success));
    }
    
    /**
     * Mark all notifications as read for user
     */
    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@PathVariable Long userId) {
        int updated = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("updated", updated));
    }
    
    /**
     * Delete all notifications for user
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Map<String, Integer>> deleteAllNotifications(@PathVariable Long userId) {
        int deleted = notificationService.deleteAllNotifications(userId);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }
    
    /**
     * Send task assignment notification
     */
    @PostMapping("/task-assigned")
    public ResponseEntity<NotificationDTO> sendTaskAssignedNotification(
            @RequestParam Long userId,
            @RequestParam String taskName,
            @RequestParam String assignerName,
            @RequestParam Long taskId) {
        
        NotificationDTO result = notificationService.sendTaskAssignedNotification(userId, taskName, assignerName, taskId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Send comment added notification
     */
    @PostMapping("/comment-added")
    public ResponseEntity<NotificationDTO> sendCommentAddedNotification(
            @RequestParam Long userId,
            @RequestParam String taskName,
            @RequestParam String commenterName,
            @RequestParam Long taskId) {
        
        NotificationDTO result = notificationService.sendCommentAddedNotification(userId, taskName, commenterName, taskId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Test endpoint to check if controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Notification controller is working!",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
    
    /**
     * Test database connection and table existence
     */
    @GetMapping("/test-db")
    public ResponseEntity<Map<String, Object>> testDatabase() {
        try {
            // Try to count notifications (this will fail if table doesn't exist)
            Long count = notificationService.getTotalNotificationCount();
            return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Database connection working!",
                "totalNotifications", count,
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", "Database error: " + e.getMessage(),
                "error", e.getClass().getSimpleName(),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
    
    /**
     * Debug endpoint to test unread notifications with detailed error info
     */
    @GetMapping("/debug/user/{userId}/unread")
    public ResponseEntity<Map<String, Object>> debugUnreadNotifications(@PathVariable Long userId) {
        try {
            List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
            Long count = notificationService.getUnreadCount(userId);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "userId", userId,
                "unreadCount", count,
                "notifications", notifications,
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "userId", userId,
                "message", "Error getting unread notifications: " + e.getMessage(),
                "error", e.getClass().getSimpleName(),
                "stackTrace", java.util.Arrays.toString(e.getStackTrace()),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
    
    /**
     * Create test notification with real-time WebSocket broadcast
     */
    @PostMapping("/test")
    public ResponseEntity<NotificationDTO> createTestNotification(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String typeString = request.get("type").toString();
            String title = request.get("title").toString();
            String message = request.get("message").toString();
            
            // Convert string to enum
            com.example.workmanagementbackend.entity.Notification.NotificationType type = 
                com.example.workmanagementbackend.entity.Notification.NotificationType.valueOf(typeString);
            
            NotificationDTO notificationDTO = NotificationDTO.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
            
            // This will save to DB AND send WebSocket message
            NotificationDTO result = notificationService.sendNotification(notificationDTO);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                NotificationDTO.builder()
                    .message("Error creating test notification: " + e.getMessage())
                    .build()
            );
        }
    }
}
