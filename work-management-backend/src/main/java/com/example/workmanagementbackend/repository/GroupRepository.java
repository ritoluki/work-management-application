package com.example.workmanagementbackend.repository;

import com.example.workmanagementbackend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByBoardIdOrderBySortOrderAsc(Long boardId);
    List<Group> findByBoardIdAndIsArchivedFalseOrderBySortOrderAsc(Long boardId);
    List<Group> findByBoardId(Long boardId);
    void deleteByBoardId(Long boardId);
}
