# Sửa lỗi Navigation từ Notification

## Vấn đề
Khi click vào "Click để xem task" trong thông báo, hệ thống báo lỗi "Không tìm thấy workspace 'Workspace'" vì:

1. **Backend**: Hàm `getTaskLocationInfo` trong `NotificationService` trả về tên cố định ("Workspace", "Board", "Group") thay vì tên thực tế từ database
2. **Frontend**: Icon "Click để xem task" chỉ hiển thị tooltip nhưng không có sự kiện click

## Giải pháp đã áp dụng

### 1. Sửa Backend (NotificationService.java)
- **Trước**: Trả về tên cố định để tránh circular dependency
- **Sau**: Lấy tên thực tế từ database thông qua các service

```java
// Trước
return new TaskLocationInfo(
    "Task " + taskId,
    null,
    "Workspace",  // ← Tên cố định
    "Board",      // ← Tên cố định  
    "Group",      // ← Tên cố định
    "Admin"
);

// Sau
return new TaskLocationInfo(
    task.getName(),
    task.getDueDate(),
    workspace.getName(),  // ← Tên thực tế từ database
    board.getName(),      // ← Tên thực tế từ database
    group.getName(),      // ← Tên thực tế từ database
    task.getAssignedToName()
);
```

### 2. Sửa Frontend (NotificationDropdown.jsx)
- **Trước**: Icon chỉ hiển thị tooltip
- **Sau**: Icon có thể click và gọi `handleNotificationClick`

```jsx
// Trước
<div className="..." title="Click để xem task">
  <ExternalLink className="w-3 h-3" />
</div>

// Sau
<button
  onClick={(e) => {
    e.stopPropagation();
    handleNotificationClick(notification);
  }}
  className="..."
  title="Click để xem task"
>
  <ExternalLink className="w-3 h-3" />
</button>
```

### 3. Cải thiện Error Handling (WorkManagement.jsx)
- Thêm logging chi tiết để debug
- Hiển thị danh sách workspaces/boards có sẵn khi không tìm thấy
- Tìm kiếm case-insensitive để tránh lỗi chính tả

## Cách hoạt động

1. **Khi tạo notification**: Backend lấy tên thực tế của workspace, board, group từ database
2. **Khi click notification**: Frontend tìm workspace/board theo tên thực tế (không phải tên cố định)
3. **Khi có lỗi**: Hiển thị thông tin chi tiết và danh sách có sẵn để user dễ debug

## Kiểm tra

1. **Restart backend** để áp dụng thay đổi Java
2. **Refresh frontend** để áp dụng thay đổi React
3. **Tạo notification mới** để test với dữ liệu thực tế
4. **Click vào notification** để kiểm tra navigation

## Lưu ý
- Đảm bảo backend có đủ các service dependencies (TaskService, GroupService, BoardService, WorkspaceService)
- Kiểm tra console log để debug nếu vẫn có vấn đề
- Notification cũ (đã tạo trước khi sửa) vẫn có thể có tên cố định
