package com.example.workmanagementbackend.repository;

import com.example.workmanagementbackend.entity.Task;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    @EntityGraph(attributePaths = {"group", "createdBy", "assignedTo"})
    List<Task> findByGroupId(Long groupId);

    @EntityGraph(attributePaths = {"group", "createdBy", "assignedTo"})
    List<Task> findByGroupBoardId(Long boardId);

    @EntityGraph(attributePaths = {"group", "createdBy", "assignedTo"})
    List<Task> findByAssignedToId(Long userId);
    void deleteByGroupId(Long groupId);
}
