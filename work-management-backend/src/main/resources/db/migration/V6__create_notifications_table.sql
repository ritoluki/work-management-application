-- Create notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT,
    metadata TEXT,
    
    -- Indexes for better performance
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_related_entity (related_entity_type, related_entity_id),
    
    -- Foreign key constraints (assuming these tables exist)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert some sample notifications for testing
INSERT INTO notifications (user_id, type, title, message, is_read, related_entity_type, related_entity_id, created_by_id) VALUES
(1, 'TASK_ASSIGNED', 'Task được giao', 'John đã giao cho bạn task "Thiết kế giao diện login"', FALSE, 'TASK', 1, 2),
(1, 'COMMENT_ADDED', 'Bình luận mới', 'Sarah đã bình luận: "Có thể thêm validation cho form này không?"', FALSE, 'TASK', 1, 3),
(1, 'DEADLINE_WARNING', 'Cảnh báo deadline', 'Task "Fix bug responsive" sẽ đến hạn trong 2 giờ nữa', TRUE, 'TASK', 2, NULL),
(2, 'BOARD_CREATED', 'Board mới', 'Manager đã tạo board "Mobile App Development"', FALSE, 'BOARD', 1, 1),
(2, 'USER_JOINED', 'Thành viên mới', 'Alex đã tham gia workspace "Tech Startup"', FALSE, 'WORKSPACE', 1, 4);

-- Create index for better WebSocket user lookup
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);
