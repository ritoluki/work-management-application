package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.Group;
import com.example.workmanagementbackend.entity.Board;
import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.entity.Task;
import com.example.workmanagementbackend.repository.GroupRepository;
import com.example.workmanagementbackend.repository.BoardRepository;
import com.example.workmanagementbackend.repository.UserRepository;
import com.example.workmanagementbackend.repository.TaskRepository;
import com.example.workmanagementbackend.dto.GroupDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<GroupDTO> getGroupsByBoardId(Long boardId) {
        List<Group> groups = groupRepository.findByBoardIdAndIsArchivedFalseOrderBySortOrderAsc(boardId);
        return groups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupDTO getGroupById(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return convertToDTO(group);
    }

    @Transactional
    public GroupDTO createGroup(GroupDTO groupDTO) {
        Board board = boardRepository.findById(groupDTO.getBoardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));

        User createdBy = userRepository.findById(groupDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = new Group();
        group.setBoard(board);
        group.setName(groupDTO.getName());
        group.setColor(groupDTO.getColor());
        group.setSortOrder(groupDTO.getSortOrder());
        group.setCreatedBy(createdBy);
        group.setIsArchived(false);

        Group savedGroup = groupRepository.save(group);
        return convertToDTO(savedGroup);
    }

    @Transactional
    public GroupDTO updateGroup(Long id, GroupDTO groupDTO) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setName(groupDTO.getName());
        group.setColor(groupDTO.getColor());
        group.setSortOrder(groupDTO.getSortOrder());

        Group savedGroup = groupRepository.save(group);
        return convertToDTO(savedGroup);
    }

    @Transactional
    public void deleteGroup(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        // Kiểm tra xem có tasks nào trong group không
        List<Task> tasks = taskRepository.findByGroupId(id);
        if (!tasks.isEmpty()) {
            throw new RuntimeException("Không thể xóa group còn chứa tasks. Vui lòng xóa tất cả tasks trước.");
        }
        
        // Xóa group nếu không còn tasks
        groupRepository.deleteById(id);
    }

    private GroupDTO convertToDTO(Group group) {
        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setColor(group.getColor());
        dto.setSortOrder(group.getSortOrder());
        dto.setIsArchived(group.getIsArchived());
        if (group.getBoard() != null) {
            dto.setBoardId(group.getBoard().getId());
        }
        if (group.getCreatedBy() != null) {
            dto.setCreatedById(group.getCreatedBy().getId());
            String first = null, last = null;
            try { first = group.getCreatedBy().getFirstName(); } catch (Exception ignore) {}
            try { last = group.getCreatedBy().getLastName(); } catch (Exception ignore) {}
            dto.setCreatedByName(((first != null ? first : "").trim() + " " + (last != null ? last : "").trim()).trim());
        }
        dto.setCreatedAt(group.getCreatedAt());
        dto.setUpdatedAt(group.getUpdatedAt());
        return dto;
    }
}
