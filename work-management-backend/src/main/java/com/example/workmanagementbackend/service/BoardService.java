package com.example.workmanagementbackend.service;

import com.example.workmanagementbackend.entity.Board;
import com.example.workmanagementbackend.entity.Workspace;
import com.example.workmanagementbackend.entity.User;
import com.example.workmanagementbackend.repository.BoardRepository;
import com.example.workmanagementbackend.repository.WorkspaceRepository;
import com.example.workmanagementbackend.repository.UserRepository;
import com.example.workmanagementbackend.repository.GroupRepository;
import com.example.workmanagementbackend.repository.TaskRepository;
import com.example.workmanagementbackend.dto.BoardDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.example.workmanagementbackend.entity.Group;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<BoardDTO> getBoardsByWorkspaceId(Long workspaceId) {
        List<Board> boards = boardRepository.findByWorkspaceIdAndIsArchivedFalse(workspaceId);
        return boards.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BoardDTO getBoardById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        return convertToDTO(board);
    }

    @Transactional
    public BoardDTO createBoard(BoardDTO boardDTO) {
        Workspace workspace = workspaceRepository.findById(boardDTO.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User createdBy = userRepository.findById(boardDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = new Board();
        board.setWorkspace(workspace);
        board.setName(boardDTO.getName());
        board.setDescription(boardDTO.getDescription());
        board.setColor(boardDTO.getColor());
        board.setCreatedBy(createdBy);
        board.setIsArchived(false);

        Board savedBoard = boardRepository.save(board);
        return convertToDTO(savedBoard);
    }

    @Transactional
    public BoardDTO updateBoard(Long id, BoardDTO boardDTO) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        board.setName(boardDTO.getName());
        board.setDescription(boardDTO.getDescription());
        board.setColor(boardDTO.getColor());

        Board savedBoard = boardRepository.save(board);
        return convertToDTO(savedBoard);
    }

    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        // Kiểm tra xem có groups nào trong board không
        List<Group> groups = groupRepository.findByBoardId(id);
        if (!groups.isEmpty()) {
            throw new RuntimeException("Không thể xóa board còn chứa groups. Vui lòng xóa tất cả groups trước.");
        }
        
        // Xóa board nếu không còn groups
        boardRepository.deleteById(id);
    }

    private BoardDTO convertToDTO(Board board) {
        BoardDTO dto = new BoardDTO();
        dto.setId(board.getId());
        dto.setName(board.getName());
        dto.setDescription(board.getDescription());
        dto.setColor(board.getColor());
        dto.setIsArchived(board.getIsArchived());
        if (board.getWorkspace() != null) {
            dto.setWorkspaceId(board.getWorkspace().getId());
        }
        if (board.getCreatedBy() != null) {
            dto.setCreatedById(board.getCreatedBy().getId());
            String first = null, last = null;
            try { first = board.getCreatedBy().getFirstName(); } catch (Exception ignore) {}
            try { last = board.getCreatedBy().getLastName(); } catch (Exception ignore) {}
            dto.setCreatedByName(((first != null ? first : "").trim() + " " + (last != null ? last : "").trim()).trim());
        }
        dto.setCreatedAt(board.getCreatedAt());
        dto.setUpdatedAt(board.getUpdatedAt());
        return dto;
    }
}
