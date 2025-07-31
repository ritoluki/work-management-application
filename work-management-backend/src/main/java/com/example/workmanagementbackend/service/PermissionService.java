package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.entity.Task;
import com.example.workmanagementbackend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class PermissionService {

    @Autowired
    private UserService userService;
    
    @Autowired
    private TaskRepository taskRepository;

    /**
     * Check if user can create tasks
     * Only OWNER, ADMIN, MANAGER can create tasks
     */
    public boolean canCreateTask(Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) return false;
            
            User user = userOpt.get();
            return user.getRole() == User.UserRole.OWNER || 
                   user.getRole() == User.UserRole.ADMIN || 
                   user.getRole() == User.UserRole.MANAGER;
        } catch (Exception e) {
            System.err.println("Error checking task creation permission: " + e.getMessage());
            return false;
        }
    }

    /**
     * Check if user can edit a specific task
     * OWNER, ADMIN, MANAGER can edit any task
     * MEMBER can only edit tasks assigned to them
     */
    public boolean canEditTask(Long userId, Long taskId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) return false;
            
            User user = userOpt.get();
            
            // OWNER, ADMIN, MANAGER can edit any task
            if (user.getRole() == User.UserRole.OWNER || 
                user.getRole() == User.UserRole.ADMIN || 
                user.getRole() == User.UserRole.MANAGER) {
                return true;
            }
            
            // MEMBER can only edit tasks assigned to them
            if (user.getRole() == User.UserRole.MEMBER) {
                Optional<Task> taskOpt = taskRepository.findById(taskId);
                if (!taskOpt.isPresent()) return false;
                
                Task task = taskOpt.get();
                return task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId);
            }
            
            // VIEWER cannot edit tasks
            return false;
        } catch (Exception e) {
            System.err.println("Error checking task edit permission: " + e.getMessage());
            return false;
        }
    }

    /**
     * Check if user can delete a specific task
     * OWNER, ADMIN, MANAGER can delete any task
     * MEMBER can only delete tasks they created
     */
    public boolean canDeleteTask(Long userId, Long taskId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) return false;
            
            User user = userOpt.get();
            
            // OWNER, ADMIN, MANAGER can delete any task
            if (user.getRole() == User.UserRole.OWNER || 
                user.getRole() == User.UserRole.ADMIN || 
                user.getRole() == User.UserRole.MANAGER) {
                return true;
            }
            
            // MEMBER can only delete tasks they created
            if (user.getRole() == User.UserRole.MEMBER) {
                Optional<Task> taskOpt = taskRepository.findById(taskId);
                if (!taskOpt.isPresent()) return false;
                
                Task task = taskOpt.get();
                return task.getCreatedBy() != null && task.getCreatedBy().getId().equals(userId);
            }
            
            // VIEWER cannot delete tasks
            return false;
        } catch (Exception e) {
            System.err.println("Error checking task delete permission: " + e.getMessage());
            return false;
        }
    }

    /**
     * Check if user can assign tasks
     * Only OWNER, ADMIN, MANAGER can assign tasks
     */
    public boolean canAssignTask(Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) return false;
            
            User user = userOpt.get();
            return user.getRole() == User.UserRole.OWNER || 
                   user.getRole() == User.UserRole.ADMIN || 
                   user.getRole() == User.UserRole.MANAGER;
        } catch (Exception e) {
            System.err.println("Error checking task assignment permission: " + e.getMessage());
            return false;
        }
    }

    /**
     * Get role hierarchy level for comparison
     */
    public int getRoleLevel(User.UserRole role) {
        switch (role) {
            case OWNER: return 5;
            case ADMIN: return 4;
            case MANAGER: return 3;
            case MEMBER: return 2;
            case VIEWER: return 1;
            default: return 0;
        }
    }

    /**
     * Check if user has minimum role level
     */
    public boolean hasMinimumRole(Long userId, User.UserRole minimumRole) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) return false;
            
            User user = userOpt.get();
            return getRoleLevel(user.getRole()) >= getRoleLevel(minimumRole);
        } catch (Exception e) {
            System.err.println("Error checking minimum role: " + e.getMessage());
            return false;
        }
    }
}
