package com.example.workmanagementbackend.controller;

import com.example.workmanagementbackend.dto.NotificationDTO;
import com.example.workmanagementbackend.dto.TaskDTO;
import com.example.workmanagementbackend.entity.Notification;
import com.example.workmanagementbackend.service.NotificationService;
import com.example.workmanagementbackend.service.PermissionService;
import com.example.workmanagementbackend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskService taskService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private PermissionService permissionService;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        try {
            return ResponseEntity.ok(taskService.getAllTasks());
        } catch (Exception e) {
            System.err.println("Error getting all tasks: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<TaskDTO>> getTasksByGroupId(@PathVariable Long groupId) {
        try {
            return ResponseEntity.ok(taskService.getTasksByGroupId(groupId));
        } catch (Exception e) {
            System.err.println("Error getting tasks by group ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<TaskDTO>> getTasksByBoardId(@PathVariable Long boardId) {
        try {
            return ResponseEntity.ok(taskService.getTasksByBoardId(boardId));
        } catch (Exception e) {
            System.err.println("Error getting tasks by board ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(taskService.getTaskById(id));
        } catch (Exception e) {
            System.err.println("Error getting task by ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO taskDTO, @RequestParam Long currentUserId) {
        try {
            // Check permission - only MANAGER and above can create tasks
            if (!permissionService.canCreateTask(currentUserId)) {
                System.err.println("User " + currentUserId + " does not have permission to create tasks");
                return ResponseEntity.status(403).build(); // Forbidden
            }
            
            System.out.println("Creating new task: " + taskDTO.getName());
            TaskDTO createdTask = taskService.createTask(taskDTO);
            
            // Send notification if task is assigned to someone
            if (createdTask.getAssignedToId() != null) {
                System.out.println("Sending task creation notification to user " + createdTask.getAssignedToId());
                NotificationDTO notification = new NotificationDTO();
                notification.setUserId(createdTask.getAssignedToId());
                notification.setType(Notification.NotificationType.TASK_ASSIGNED);
                notification.setTitle("Task mới được giao");
                notification.setMessage("Bạn đã được giao task mới \"" + createdTask.getName() + "\"");
                notification.setRelatedEntityType(Notification.RelatedEntityType.TASK);
                notification.setRelatedEntityId(createdTask.getId());
                notification.setCreatedById(createdTask.getCreatedById()); // Task creator
                
                notificationService.sendNotification(notification);
                System.out.println("Task creation notification sent successfully!");
            } else {
                System.out.println("No user assigned to new task - skipping notification");
            }
            
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            System.err.println("Error creating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO, @RequestParam Long currentUserId) {
        try {
            // Check permission - MANAGER+ can edit any task, MEMBER can only edit assigned tasks
            if (!permissionService.canEditTask(currentUserId, id)) {
                System.err.println("User " + currentUserId + " does not have permission to edit task " + id);
                return ResponseEntity.status(403).build(); // Forbidden
            }
            
            System.out.println("Updating task with ID: " + id);
            System.out.println("TaskDTO: " + taskDTO);
            
            // Get old task to check status changes
            TaskDTO oldTask = taskService.getTaskById(id);
            
            // Update task
            TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
            System.out.println("Updated task assigned to ID: " + updatedTask.getAssignedToId());
            
            // Check if task status changed to DONE
            boolean taskCompleted = !"DONE".equals(oldTask.getStatus()) && "DONE".equals(updatedTask.getStatus());
            
            // Send notification if task has assigned user OR creator
            Long notificationUserId = null;
            if (updatedTask.getAssignedToId() != null) {
                notificationUserId = updatedTask.getAssignedToId();
                System.out.println("Sending notification to assigned user: " + notificationUserId);
            } else if (updatedTask.getCreatedById() != null) {
                notificationUserId = updatedTask.getCreatedById();
                System.out.println("Sending notification to task creator: " + notificationUserId);
            }
            
            if (notificationUserId != null) {
                System.out.println("Sending notification for task update...");
                NotificationDTO notification = new NotificationDTO();
                notification.setUserId(notificationUserId);
                
                // Different notification for task completion
                if (taskCompleted) {
                    notification.setType(Notification.NotificationType.TASK_COMPLETED);
                    notification.setTitle("Task hoàn thành");
                    notification.setMessage("Task \"" + updatedTask.getName() + "\" đã được hoàn thành! 🎉");
                    System.out.println("Sending TASK_COMPLETED notification");
                } else {
                    notification.setType(Notification.NotificationType.TASK_UPDATED);
                    notification.setTitle("Task được cập nhật");
                    notification.setMessage("Task \"" + updatedTask.getName() + "\" đã được cập nhật");
                    System.out.println("Sending TASK_UPDATED notification");
                }
                
                notification.setRelatedEntityType(Notification.RelatedEntityType.TASK);
                notification.setRelatedEntityId(updatedTask.getId());
                notification.setCreatedById(currentUserId); // User who updated the task
                
                notificationService.sendNotification(notification);
                System.out.println("Notification sent successfully!");
            } else {
                System.out.println("No assigned user or creator - skipping notification");
            }
            
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            System.err.println("Error updating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{taskId}/assign/{userId}")
    public ResponseEntity<TaskDTO> assignTask(@PathVariable Long taskId, @PathVariable Long userId, @RequestParam Long currentUserId) {
        try {
            // Check permission - only MANAGER+ can assign tasks
            if (!permissionService.canAssignTask(currentUserId)) {
                System.err.println("User " + currentUserId + " does not have permission to assign tasks");
                return ResponseEntity.status(403).build(); // Forbidden
            }
            
            System.out.println("Assigning task " + taskId + " to user " + userId);
            TaskDTO assignedTask = taskService.assignTask(taskId, userId);
            
            // Send notification to assigned user
            System.out.println("Sending assignment notification to user " + userId);
            NotificationDTO notification = new NotificationDTO();
            notification.setUserId(userId);
            notification.setType(Notification.NotificationType.TASK_ASSIGNED);
            notification.setTitle("Task được giao");
            notification.setMessage("Bạn đã được giao task \"" + assignedTask.getName() + "\"");
            notification.setRelatedEntityType(Notification.RelatedEntityType.TASK);
            notification.setRelatedEntityId(assignedTask.getId());
            notification.setCreatedById(currentUserId); // Current user assigning the task
            
            notificationService.sendNotification(notification);
            System.out.println("Assignment notification sent successfully!");
            
            return ResponseEntity.ok(assignedTask);
        } catch (Exception e) {
            System.err.println("Error assigning task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @RequestParam Long currentUserId) {
        try {
            // Check permission - MANAGER+ can delete any task, MEMBER can only delete own tasks
            if (!permissionService.canDeleteTask(currentUserId, id)) {
                System.err.println("User " + currentUserId + " does not have permission to delete task " + id);
                return ResponseEntity.status(403).build(); // Forbidden
            }
            
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
