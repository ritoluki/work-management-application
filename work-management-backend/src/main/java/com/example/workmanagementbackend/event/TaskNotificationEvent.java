package com.example.workmanagementbackend.event;

import com.example.workmanagementbackend.entity.Notification.NotificationType;
import org.springframework.context.ApplicationEvent;

public class TaskNotificationEvent extends ApplicationEvent {
    
    private final Long taskId;
    private final Long userId;
    private final NotificationType notificationType;
    private final Long createdById;
    
    public TaskNotificationEvent(Object source, Long taskId, Long userId, NotificationType notificationType, Long createdById) {
        super(source);
        this.taskId = taskId;
        this.userId = userId;
        this.notificationType = notificationType;
        this.createdById = createdById;
    }
    
    public Long getTaskId() {
        return taskId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public NotificationType getNotificationType() {
        return notificationType;
    }
    
    public Long getCreatedById() {
        return createdById;
    }
}
