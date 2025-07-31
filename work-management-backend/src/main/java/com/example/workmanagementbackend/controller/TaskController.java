package com.example.workmanagementbackend.controller;

import com.example.workmanagementbackend.dto.TaskDTO;
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
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO taskDTO) {
        try {
            return ResponseEntity.ok(taskService.createTask(taskDTO));
        } catch (Exception e) {
            System.err.println("Error creating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        try {
            System.out.println("Updating task with ID: " + id);
            System.out.println("TaskDTO: " + taskDTO);
            return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
        } catch (Exception e) {
            System.err.println("Error updating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{taskId}/assign/{userId}")
    public ResponseEntity<TaskDTO> assignTask(@PathVariable Long taskId, @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(taskService.assignTask(taskId, userId));
        } catch (Exception e) {
            System.err.println("Error assigning task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
