package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.Task;
import com.example.workmanagementbackend.entity.Group;
import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.repository.TaskRepository;
import com.example.workmanagementbackend.repository.GroupRepository;
import com.example.workmanagementbackend.repository.UserRepository;
import com.example.workmanagementbackend.dto.TaskDTO;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;



    @Transactional(readOnly = true)
    public List<TaskDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByGroupId(Long groupId) {
        List<Task> tasks = taskRepository.findByGroupId(groupId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByBoardId(Long boardId) {
        List<Task> tasks = taskRepository.findByGroupBoardId(boardId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return convertToDTO(task);
    }

    @Transactional
    public TaskDTO createTask(TaskDTO taskDTO) {
        Group group = groupRepository.findById(taskDTO.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User createdBy = userRepository.findById(taskDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();
        task.setGroup(group);
        task.setName(taskDTO.getName());
        task.setDescription(taskDTO.getDescription());
        
        // Handle status enum safely
        if (taskDTO.getStatus() != null && !taskDTO.getStatus().trim().isEmpty()) {
            try {
                task.setStatus(Task.TaskStatus.valueOf(taskDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                task.setStatus(Task.TaskStatus.TODO);
            }
        } else {
            task.setStatus(Task.TaskStatus.TODO);
        }
        
        task.setDueDate(taskDTO.getDueDate());
        task.setTimeline(taskDTO.getTimeline());
        task.setNotes(taskDTO.getNotes());
        
        // Handle priority enum safely
        if (taskDTO.getPriority() != null && !taskDTO.getPriority().trim().isEmpty()) {
            try {
                task.setPriority(Task.TaskPriority.valueOf(taskDTO.getPriority()));
            } catch (IllegalArgumentException e) {
                task.setPriority(Task.TaskPriority.NORMAL);
            }
        } else {
            task.setPriority(Task.TaskPriority.NORMAL);
        }
        
        task.setCreatedBy(createdBy);

        try {
            if (taskDTO.getAssignedToId() != null) {
                userRepository.findById(taskDTO.getAssignedToId()).ifPresent(task::setAssignedTo);
            }
        } catch (Exception ignore) {}

        Task savedTask = taskRepository.save(task);
        
        // Note: Notification is now handled by TaskController.createTask() 
        // to avoid duplicate notifications. Event-based system removed.
        
        return convertToDTO(savedTask);
    }

    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Update basic fields
        if (taskDTO.getName() != null) {
            task.setName(taskDTO.getName());
        }
        if (taskDTO.getDescription() != null) {
            task.setDescription(taskDTO.getDescription());
        }
        
        // Handle status enum safely
        if (taskDTO.getStatus() != null && !taskDTO.getStatus().trim().isEmpty()) {
            try {
                task.setStatus(Task.TaskStatus.valueOf(taskDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                // Keep existing status if invalid
                System.err.println("Invalid status: " + taskDTO.getStatus());
            }
        }
        
        if (taskDTO.getDueDate() != null) {
            task.setDueDate(taskDTO.getDueDate());
        }
        if (taskDTO.getTimeline() != null) {
            task.setTimeline(taskDTO.getTimeline());
        }
        if (taskDTO.getNotes() != null) {
            task.setNotes(taskDTO.getNotes());
        }
        
        // Handle priority enum safely
        if (taskDTO.getPriority() != null && !taskDTO.getPriority().trim().isEmpty()) {
            try {
                task.setPriority(Task.TaskPriority.valueOf(taskDTO.getPriority()));
            } catch (IllegalArgumentException e) {
                // Keep existing priority if invalid
                System.err.println("Invalid priority: " + taskDTO.getPriority());
            }
        }

        // Handle assigned user
        try {
            if (taskDTO.getAssignedToId() != null) {
                userRepository.findById(taskDTO.getAssignedToId()).ifPresent(task::setAssignedTo);
            } else {
                task.setAssignedTo(null);
            }
        } catch (Exception ignore) {}

        Task savedTask = taskRepository.save(task);
        
        // Note: Notification is now handled by TaskController.updateTask() 
        // to avoid duplicate notifications. Event-based system removed.
        
        return convertToDTO(savedTask);
    }

    @Transactional
    public TaskDTO assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        task.setAssignedTo(user);
        Task savedTask = taskRepository.save(task);
        
        // Note: Notification is now handled by TaskController.assignTask() 
        // to avoid duplicate notifications. Event-based system removed.
        
        return convertToDTO(savedTask);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setName(task.getName());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus() != null ? task.getStatus().name() : null);
        dto.setDueDate(task.getDueDate());
        dto.setTimeline(task.getTimeline());
        dto.setNotes(task.getNotes());
        dto.setPriority(task.getPriority() != null ? task.getPriority().name() : null);
        // Defensive: avoid lazy init by accessing only IDs and composing names with null checks
        if (task.getGroup() != null) {
            dto.setGroupId(task.getGroup().getId());
        }
        if (task.getCreatedBy() != null) {
            dto.setCreatedById(task.getCreatedBy().getId());
            String first = null;
            String last = null;
            try { first = task.getCreatedBy().getFirstName(); } catch (Exception ignore) {}
            try { last = task.getCreatedBy().getLastName(); } catch (Exception ignore) {}
            dto.setCreatedByName(((first != null ? first : "").trim() + " " + (last != null ? last : "").trim()).trim());
        }
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        if (task.getAssignedTo() != null) {
            dto.setAssignedToId(task.getAssignedTo().getId());
            String f = null; String l = null;
            try { f = task.getAssignedTo().getFirstName(); } catch (Exception ignore) {}
            try { l = task.getAssignedTo().getLastName(); } catch (Exception ignore) {}
            if (f != null || l != null) {
                dto.setAssignedToName(((f != null ? f : "").trim() + " " + (l != null ? l : "").trim()).trim());
            }
        }

        return dto;
    }
}
