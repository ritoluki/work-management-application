package com.example.workmanagementbackend.repository;

import com.example.workmanagementbackend.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByWorkspaceId(Long workspaceId);
    List<Board> findByWorkspaceIdAndIsArchivedFalse(Long workspaceId);
    void deleteByWorkspaceId(Long workspaceId);
}
