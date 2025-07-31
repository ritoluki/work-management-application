package com.example.workmanagementbackend.config;

import com.example.workmanagementbackend.entity.*;
import com.example.workmanagementbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public void run(String... args) throws Exception {
        // Chỉ tạo dữ liệu nếu chưa có
        if (userRepository.count() == 0) {
            createSampleData();
        }
    }

    private void createSampleData() {
        // Tạo users với role
        User admin = createUser("admin@demo.com", "Admin", "User", "Có toàn quyền quản lý workspace, board, và user", User.UserRole.ADMIN);
        User manager = createUser("manager@demo.com", "Manager", "User", "Có thể tạo/sửa board và task, không thể xóa workspace", User.UserRole.MANAGER);
        User member = createUser("member@demo.com", "Member", "User", "Có thể tạo/sửa task, không thể xóa board", User.UserRole.MEMBER);
        User viewer = createUser("viewer@demo.com", "Viewer", "User", "Chỉ có thể xem, không thể chỉnh sửa", User.UserRole.VIEWER);

        // Tạo workspace
        Workspace workspace = createWorkspace("Main workspace", "Workspace chính", admin);

        // Tạo board
        Board board = createBoard("TakaIT", "Board dự án TakaIT", "blue", workspace, admin);

        // Tạo groups
        Group todoGroup = createGroup("To-Do", "blue", 0, board, admin);
        Group featureGroup = createGroup("Feature todo", "green", 1, board, admin);

        // Tạo tasks
        createTask("Task 1", "Working on it", LocalDate.of(2024, 7, 21), "Jul 21 - 22", "Action items", "high", todoGroup, admin);
        createTask("Task 2", "Done", LocalDate.of(2024, 7, 22), "Jul 23 - 24", "Meeting notes", "normal", todoGroup, admin);
        createTask("Task 3", "Todo", LocalDate.of(2024, 7, 23), "Jul 25 - 26", "Other", "low", todoGroup, admin);
        createTask("Lập trình chức năng margin", "Expired", LocalDate.of(2024, 7, 19), "Jul 1 - 19", "Lập trình chức năng...", "high", todoGroup, admin);
    }

    private User createUser(String email, String firstName, String lastName, String description, User.UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("$2a$10$dummy"); // Trong thực tế sẽ hash password
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setDescription(description);
        user.setRole(role);
        user.setIsActive(true);
        return userRepository.save(user);
    }

    private Workspace createWorkspace(String name, String description, User owner) {
        Workspace workspace = new Workspace();
        workspace.setName(name);
        workspace.setDescription(description);
        workspace.setOwner(owner);
        workspace.setIsArchived(false);
        return workspaceRepository.save(workspace);
    }

    private Board createBoard(String name, String description, String color, Workspace workspace, User createdBy) {
        Board board = new Board();
        board.setName(name);
        board.setDescription(description);
        board.setColor(color);
        board.setWorkspace(workspace);
        board.setCreatedBy(createdBy);
        board.setIsArchived(false);
        return boardRepository.save(board);
    }

    private Group createGroup(String name, String color, Integer sortOrder, Board board, User createdBy) {
        Group group = new Group();
        group.setName(name);
        group.setColor(color);
        group.setSortOrder(sortOrder);
        group.setBoard(board);
        group.setCreatedBy(createdBy);
        group.setIsArchived(false);
        return groupRepository.save(group);
    }

    private Task createTask(String name, String status, LocalDate dueDate, String timeline, String notes, String priority, Group group, User createdBy) {
        Task task = new Task();
        task.setName(name);
        task.setStatus(Task.TaskStatus.valueOf(status));
        task.setDueDate(dueDate);
        task.setTimeline(timeline);
        task.setNotes(notes);
        task.setPriority(Task.TaskPriority.valueOf(priority));
        task.setGroup(group);
        task.setCreatedBy(createdBy);
        return taskRepository.save(task);
    }
}