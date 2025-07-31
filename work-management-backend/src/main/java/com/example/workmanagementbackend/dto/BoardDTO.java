package com.example.workmanagementbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Boolean isArchived;
    private Long workspaceId;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<GroupDTO> groups;
}
