package com.example.workmanagementbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    private Long id;
    private String name;
    private String color;
    private Integer sortOrder;
    private Boolean isArchived;
    private Long boardId;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TaskDTO> tasks;
}
