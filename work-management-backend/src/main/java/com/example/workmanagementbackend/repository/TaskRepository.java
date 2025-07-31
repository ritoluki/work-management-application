package com.example.workmanagementbackend.repository;

import com.example.workmanagementbackend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByGroupId(Long groupId);
    List<Task> findByGroupBoardId(Long boardId);
    List<Task> findByAssignedToId(Long userId);
    void deleteByGroupId(Long groupId);
}
