package com.example.workmanagementbackend.controller;

import com.example.workmanagementbackend.dto.NotificationDTO;
import com.example.workmanagementbackend.dto.TaskDTO;
import com.example.workmanagementbackend.entity.Notification;
import com.example.workmanagementbackend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private PermissionService permissionService;
    
    @Autowired
    private GroupService groupService;
    
    @Autowired
    private BoardService boardService;
    
    @Autowired
    private WorkspaceService workspaceService;
    
    @Autowired
    private UserService userService;

    /**
     * Helper method to get task location information
     */
    private TaskLocationInfo getTaskLocationInfo(Long groupId) {
        try {
            var group = groupService.getGroupById(groupId);
            var board = boardService.getBoardById(group.getBoardId());
            var workspace = workspaceService.getWorkspaceById(board.getWorkspaceId());
            
            return new TaskLocationInfo(
                workspace.getName(),
                board.getName(),
                group.getName()
            );
        } catch (Exception e) {
            System.err.println("Error getting task location info: " + e.getMessage());
            return new TaskLocationInfo("Unknown Workspace", "Unknown Board", "Unknown Group");
        }
    }
    
    /**
     * Helper class to hold task location information
     */
    private static class TaskLocationInfo {
        private final String workspaceName;
        private final String boardName;
        private final String groupName;
        
        public TaskLocationInfo(String workspaceName, String boardName, String groupName) {
            this.workspaceName = workspaceName;
            this.boardName = boardName;
            this.groupName = groupName;
        }
        
        public String getWorkspaceName() { return workspaceName; }
        public String getBoardName() { return boardName; }
        public String getGroupName() { return groupName; }
    }

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
                System.out.println("Sending detailed task creation notification to user " + createdTask.getAssignedToId());
                
                // Get task location information
                TaskLocationInfo locationInfo = getTaskLocationInfo(createdTask.getGroupId());
                
                // Get assignor name
                String assignedBy = "Admin";
                try {
                    var currentUserOpt = userService.getUserById(currentUserId);
                    if (currentUserOpt.isPresent()) {
                        assignedBy = currentUserOpt.get().getRole().toString();
                    }
                } catch (Exception e) {
                    System.err.println("Could not get current user info: " + e.getMessage());
                }
                
                // Create detailed notification
                NotificationDTO notification = new NotificationDTO();
                notification.setUserId(createdTask.getAssignedToId());
                notification.setType(Notification.NotificationType.TASK_ASSIGNED);
                notification.setTitle("Task mới được giao");
                notification.setMessage("Bạn đã được giao task mới \"" + createdTask.getName() + "\""); // Will be replaced by detailed message
                notification.setRelatedEntityType(Notification.RelatedEntityType.TASK);
                notification.setRelatedEntityId(createdTask.getId());
                notification.setCreatedById(currentUserId); // Task creator
                
                // Send detailed notification
                notificationService.sendTaskNotification(
                    notification,
                    createdTask.getName(),
                    createdTask.getDueDate() != null ? createdTask.getDueDate().toString() : null,
                    locationInfo.getWorkspaceName(),
                    locationInfo.getBoardName(),
                    locationInfo.getGroupName(),
                    assignedBy
                );
                
                System.out.println("Detailed task creation notification sent successfully!");
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
        // 1) Permission check
        if (!permissionService.canEditTask(currentUserId, id)) {
            System.err.println("User " + currentUserId + " does not have permission to edit task " + id);
            return ResponseEntity.status(403).build();
        }

        // 2) Update task first; never fail response because of side-effects later
        TaskDTO oldTask = taskService.getTaskById(id);
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);

        // 3) Fire-and-forget notifications; isolate errors
        try {
            boolean taskCompleted = !"DONE".equals(oldTask.getStatus()) && "DONE".equals(updatedTask.getStatus());
            Long notificationUserId = updatedTask.getAssignedToId() != null
                    ? updatedTask.getAssignedToId()
                    : updatedTask.getCreatedById();
            if (notificationUserId != null) {
                Notification.NotificationType type = taskCompleted
                        ? Notification.NotificationType.TASK_COMPLETED
                        : Notification.NotificationType.TASK_UPDATED;
                notificationService.sendEnhancedTaskNotification(
                        updatedTask.getId(), notificationUserId, type, currentUserId);
            }
        } catch (Exception ignore) {
            System.err.println("Notification step failed but update succeeded");
        }

        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/{taskId}/assign/{userId}")
    public ResponseEntity<TaskDTO> assignTask(@PathVariable Long taskId, @PathVariable Long userId, @RequestParam Long currentUserId) {
        // Permission check
        if (!permissionService.canAssignTask(currentUserId)) {
            System.err.println("User " + currentUserId + " does not have permission to assign tasks");
            return ResponseEntity.status(403).build();
        }
        TaskDTO assignedTask = taskService.assignTask(taskId, userId);
        try {
            notificationService.sendEnhancedTaskNotification(
                    assignedTask.getId(), userId, Notification.NotificationType.TASK_ASSIGNED, currentUserId);
        } catch (Exception ignore) {
            System.err.println("Notification step failed but assignment succeeded");
        }
        return ResponseEntity.ok(assignedTask);
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
