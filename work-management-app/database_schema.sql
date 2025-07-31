-- =====================================================
-- WORK MANAGEMENT APPLICATION - DATABASE SCHEMA
-- =====================================================
-- Tạo database cho ứng dụng quản lý công việc
-- Gồm 6 bảng cốt lõi: Users, Workspaces, Workspace_Members, Boards, Groups, Tasks
-- =====================================================

-- Tạo database (nếu chưa có)
-- CREATE DATABASE work_management_db;
-- USE work_management_db;

-- =====================================================
-- 1. BẢNG USERS - Quản lý người dùng
-- =====================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. BẢNG WORKSPACES - Không gian làm việc
-- =====================================================
CREATE TABLE workspaces (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    owner_id BIGINT NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. BẢNG WORKSPACE_MEMBERS - Hệ thống phân quyền RBAC
-- =====================================================
CREATE TABLE workspace_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workspace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role ENUM('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER') NOT NULL DEFAULT 'MEMBER',
    invited_by BIGINT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_workspace_user (workspace_id, user_id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 4. BẢNG BOARDS - Bảng dự án
-- =====================================================
CREATE TABLE boards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workspace_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    color VARCHAR(50) DEFAULT 'blue',
    is_archived BOOLEAN DEFAULT FALSE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. BẢNG GROUPS - Nhóm công việc
-- =====================================================
CREATE TABLE groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    board_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'blue',
    sort_order INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. BẢNG TASKS - Công việc cụ thể
-- =====================================================
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT NULL,
    status ENUM('Todo', 'Working on it', 'Done', 'Expired') DEFAULT 'Todo',
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    due_date DATE NULL,
    timeline VARCHAR(100) NULL,
    notes TEXT NULL,
    sort_order INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_by BIGINT NOT NULL,
    assigned_to BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- INDEXES - Tối ưu hiệu suất query
-- =====================================================
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_boards_workspace ON boards(workspace_id);
CREATE INDEX idx_groups_board ON groups(board_id);
CREATE INDEX idx_tasks_group ON tasks(group_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- SAMPLE DATA - Dữ liệu mẫu để test
-- =====================================================

-- Insert sample users (password: 123456)
INSERT INTO users (email, password_hash, first_name, last_name, description) VALUES
('admin@demo.com', '$2b$10$hashed_password_here', 'Admin', 'User', 'Có toàn quyền quản lý workspace, board, và user'),
('manager@demo.com', '$2b$10$hashed_password_here', 'Manager', 'User', 'Có thể tạo/sửa board và task, không thể xóa workspace'),
('member@demo.com', '$2b$10$hashed_password_here', 'Member', 'User', 'Có thể tạo/sửa task, không thể xóa board'),
('viewer@demo.com', '$2b$10$hashed_password_here', 'Viewer', 'User', 'Chỉ có thể xem, không thể chỉnh sửa');

-- Insert sample workspace
INSERT INTO workspaces (name, description, owner_id) VALUES
('Main workspace', 'Workspace chính cho dự án', 1);

-- Insert workspace members với roles
INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
(1, 1, 'ADMIN'),
(1, 2, 'MANAGER'),
(1, 3, 'MEMBER'),
(1, 4, 'VIEWER');

-- Insert sample board
INSERT INTO boards (workspace_id, name, description, created_by) VALUES
(1, 'TakaIT', 'Dự án TakaIT', 1);

-- Insert sample groups
INSERT INTO groups (board_id, name, color, created_by) VALUES
(1, 'To-Do', 'blue', 1),
(1, 'Feature todo', 'green', 1);

-- Insert sample tasks
INSERT INTO tasks (group_id, name, status, priority, due_date, timeline, notes, created_by) VALUES
(1, 'Task 1', 'Working on it', 'high', '2024-07-21', 'Jul 21 - 22', 'Action items', 1),
(1, 'Task 2', 'Done', 'normal', '2024-07-22', 'Jul 23 - 24', 'Meeting notes', 1),
(1, 'Task 3', 'Todo', 'low', '2024-07-23', 'Jul 25 - 26', 'Other', 1),
(1, 'Lập trình chức năng margin', 'Expired', 'high', '2024-07-19', 'Jul 1 - 19', 'Lập trình chức năng...', 1);

-- =====================================================
-- USEFUL QUERIES - Các query thường dùng
-- =====================================================

-- Lấy tất cả workspace của user
-- SELECT w.* FROM workspaces w
-- JOIN workspace_members wm ON w.id = wm.workspace_id
-- WHERE wm.user_id = ?;

-- Lấy role của user trong workspace
-- SELECT role FROM workspace_members 
-- WHERE workspace_id = ? AND user_id = ?;

-- Lấy tất cả boards trong workspace
-- SELECT b.* FROM boards b
-- WHERE b.workspace_id = ?;

-- Lấy tất cả tasks trong board
-- SELECT t.*, g.name as group_name, u.first_name, u.last_name
-- FROM tasks t
-- JOIN groups g ON t.group_id = g.id
-- JOIN boards b ON g.board_id = b.id
-- LEFT JOIN users u ON t.assigned_to = u.id
-- WHERE b.id = ?;

-- Lấy tasks được assign cho user
-- SELECT t.*, g.name as group_name, b.name as board_name
-- FROM tasks t
-- JOIN groups g ON t.group_id = g.id
-- JOIN boards b ON g.board_id = b.id
-- WHERE t.assigned_to = ?;

-- =====================================================
-- ROLE PERMISSIONS - Ma trận phân quyền
-- =====================================================
/*
OWNER: Tất cả quyền
ADMIN: Quản lý workspace, board, user (không thể xóa workspace)
MANAGER: Quản lý board, group, task (không thể xóa workspace)
MEMBER: Tạo/sửa task, comment (không thể xóa board/group)
VIEWER: Chỉ xem, không chỉnh sửa
*/

-- =====================================================
-- END OF SCHEMA
-- ===================================================== 