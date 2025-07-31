package com.example.workmanagementbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceDTO {
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerName;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<BoardDTO> boards;
}
