# Sửa Bug Duplicate Notifications

## Vấn đề
Khi sửa một task (ví dụ tên "111111"), sau khi lưu thì có **2 thông báo trả về**:
- 1 thông báo đúng task bạn sửa
- 1 thông báo sai task khác

## Nguyên nhân
Có **2 cơ chế gửi notification song song**:

1. **Event-based system**: `TaskService` gửi `TaskNotificationEvent` → `NotificationService.handleTaskNotificationEvent()` xử lý
2. **Direct call system**: `TaskController` gọi trực tiếp `notificationService.sendEnhancedTaskNotification()`

**Kết quả**: 2 notification được gửi cho cùng 1 task update!

## Giải pháp
Loại bỏ hoàn toàn **event-based system** để tránh duplicate notifications:

### 1. Sửa `TaskService.java`
- Loại bỏ `ApplicationEventPublisher` dependency
- Loại bỏ tất cả `eventPublisher.publishEvent()` calls trong:
  - `createTask()`
  - `updateTask()` 
  - `assignTask()`

### 2. Sửa `NotificationService.java`
- Loại bỏ `@EventListener` annotation
- Loại bỏ method `handleTaskNotificationEvent()`
- Loại bỏ method `getNotificationTitle()`
- Loại bỏ imports không cần thiết:
  - `TaskNotificationEvent`
  - `EventListener`

### 3. Giữ lại `TaskController` notification calls
- `createTask()` → `notificationService.sendTaskNotification()`
- `updateTask()` → `notificationService.sendEnhancedTaskNotification()`
- `assignTask()` → `notificationService.sendEnhancedTaskNotification()`

## Lợi ích
1. **Không còn duplicate notifications**
2. **Code đơn giản hơn** - chỉ 1 cơ chế gửi notification
3. **Dễ debug và maintain** hơn
4. **Performance tốt hơn** - không còn event processing overhead

## Kiểm tra
Sau khi sửa:
1. Sửa một task bất kỳ
2. Chỉ nhận được **1 notification** đúng task
3. Không còn notification sai task khác

## Files đã sửa
- `TaskService.java` - Loại bỏ event publishing
- `NotificationService.java` - Loại bỏ event listener
- `TaskController.java` - Giữ nguyên direct notification calls

## Lưu ý
- Event-based system đã được loại bỏ hoàn toàn
- Tất cả notifications giờ đây được gửi trực tiếp từ Controller
- Method `getTaskLocationInfo()` vẫn hoạt động bình thường để lấy thông tin workspace/board/group chính xác
