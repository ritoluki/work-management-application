package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.Workspace;
import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.entity.Board;
import com.example.workmanagementbackend.entity.Group;
import com.example.workmanagementbackend.repository.WorkspaceRepository;
import com.example.workmanagementbackend.repository.UserRepository;
import com.example.workmanagementbackend.repository.BoardRepository;
import com.example.workmanagementbackend.repository.GroupRepository;
import com.example.workmanagementbackend.repository.TaskRepository;
import com.example.workmanagementbackend.dto.WorkspaceDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<WorkspaceDTO> getAllWorkspaces() {
        List<Workspace> workspaces = workspaceRepository.findByIsArchivedFalse();
        return workspaces.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkspaceDTO getWorkspaceById(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        return convertToDTO(workspace);
    }

    public WorkspaceDTO createWorkspace(WorkspaceDTO workspaceDTO) {
        User owner = userRepository.findById(workspaceDTO.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = new Workspace();
        workspace.setName(workspaceDTO.getName());
        workspace.setDescription(workspaceDTO.getDescription());
        workspace.setOwner(owner);
        workspace.setIsArchived(false);

        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return convertToDTO(savedWorkspace);
    }

    public WorkspaceDTO updateWorkspace(Long id, WorkspaceDTO workspaceDTO) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        workspace.setName(workspaceDTO.getName());
        workspace.setDescription(workspaceDTO.getDescription());

        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return convertToDTO(savedWorkspace);
    }

    @Transactional
    public void deleteWorkspace(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        
        // Kiểm tra xem có boards nào trong workspace không
        List<Board> boards = boardRepository.findByWorkspaceId(id);
        if (!boards.isEmpty()) {
            throw new RuntimeException("Không thể xóa workspace còn chứa boards. Vui lòng xóa tất cả boards trước.");
        }
        
        // Xóa workspace nếu không còn boards
        workspaceRepository.deleteById(id);
    }

    private WorkspaceDTO convertToDTO(Workspace workspace) {
        WorkspaceDTO dto = new WorkspaceDTO();
        dto.setId(workspace.getId());
        dto.setName(workspace.getName());
        dto.setDescription(workspace.getDescription());
        dto.setOwnerId(workspace.getOwner().getId());
        dto.setOwnerName(workspace.getOwner().getFirstName() + " " + workspace.getOwner().getLastName());
        dto.setIsArchived(workspace.getIsArchived());
        dto.setCreatedAt(workspace.getCreatedAt());
        dto.setUpdatedAt(workspace.getUpdatedAt());
        return dto;
    }
}
