package com.example.workmanagementbackend.repository;

import com.example.workmanagementbackend.entity.Workspace;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOwnerId(Long ownerId);

    @EntityGraph(attributePaths = {"owner"})
    List<Workspace> findByIsArchivedFalse();
}
