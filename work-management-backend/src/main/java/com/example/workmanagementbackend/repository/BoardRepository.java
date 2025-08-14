package com.example.workmanagementbackend.repository;

import com.example.workmanagementbackend.entity.Board;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    @EntityGraph(attributePaths = {"workspace", "createdBy"})
    List<Board> findByWorkspaceId(Long workspaceId);

    @EntityGraph(attributePaths = {"workspace", "createdBy"})
    List<Board> findByWorkspaceIdAndIsArchivedFalse(Long workspaceId);
    void deleteByWorkspaceId(Long workspaceId);
}
