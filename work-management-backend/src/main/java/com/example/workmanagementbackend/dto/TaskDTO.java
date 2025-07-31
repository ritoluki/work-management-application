package com.example.workmanagementbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDate dueDate;
    private String timeline;
    private String notes;
    private String priority;
    private Long groupId;
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
