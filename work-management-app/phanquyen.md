HƯỚNG DẪN HỆ THỐNG PHÂN QUYỀN - WORK MANAGEMENT APPLICATION
================================================================
Tài liệu tham khảo cho việc phát triển và maintain hệ thống phân quyền

Phiên bản: 1.1
Ngày tạo: 28/07/2024
Ngày cập nhật: 31/07/2025

TỔNG QUAN HỆ THỐNG
==================

Hệ thống phân quyền được thiết kế theo mô hình RBAC (Role-Based Access Control) với 
4 cấp độ quyền hạn khác nhau, áp dụng trên 4 cấp độ resource chính:

- WORKSPACE LEVEL: Quản lý toàn bộ không gian làm việc
- BOARD LEVEL: Quản lý boards và projects
- GROUP LEVEL: Quản lý nhóm tasks
- TASK LEVEL: Quản lý công việc cụ thể

ROLES VÀ HIERARCHY
==================

📊 ROLE HIERARCHY (từ cao xuống thấp):
1. ADMIN ⚡ - Quản trị viên
2. MANAGER 📋 - Quản lý
3. MEMBER 👤 - Thành viên
4. VIEWER 👁️ - Người xem

ROLE DEFINITIONS
================

1. ADMIN (Quản trị viên) ⚡
   - Mô tả: Quyền hạn cao nhất trong workspace
   - Use case: CEO, Product Manager, Engineering Manager, Project Director
   - Đặc điểm: Toàn quyền quản lý workspace, members và tất cả resources
   - Số lượng: Ít nhất 1 Admin/workspace

2. MANAGER (Quản lý) 📋  
   - Mô tả: Quản lý operations, boards và teams
   - Use case: Feature Lead, Team Lead, Senior Developer
   - Đặc điểm: Có thể manage members nhưng không thể đổi role Admin

3. MEMBER (Thành viên) 👤
   - Mô tả: User làm việc với tasks được assign
   - Use case: Developer, Designer, QA, Content Writer
   - Đặc điểm: Chỉ có thể update tasks được assign cho họ

4. VIEWER (Người xem) 👁️
   - Mô tả: Chỉ xem, không chỉnh sửa
   - Use case: Stakeholder, Client, Analyst, Intern
   - Đặc điểm: Read-only access

PERMISSION MATRIX CHI TIẾT
==========================

📌 WORKSPACE PERMISSIONS
========================
Chức năng                    | Admin | Manager | Member | Viewer
---------------------------- |-------|---------|--------|--------
Tạo workspace               | ✅    | ❌      | ❌     | ❌
Xóa workspace               | ✅    | ❌      | ❌     | ❌
Archive workspace           | ✅    | ❌      | ❌     | ❌
Sửa workspace settings      | ✅    | ❌      | ❌     | ❌
Invite members              | ✅    | ✅      | ❌     | ❌
Remove members              | ✅    | ✅*     | ❌     | ❌
Change roles                | ✅    | ❌      | ❌     | ❌
View workspace analytics    | ✅    | ✅      | ❌     | ❌

📌 BOARD PERMISSIONS  
====================
Chức năng                    | Admin | Manager | Member | Viewer
---------------------------- |-------|---------|--------|--------
Tạo board                   | ✅    | ✅      | ❌     | ❌
Xóa board                   | ✅    | ❌      | ❌     | ❌
Archive board               | ✅    | ✅      | ❌     | ❌
Sửa board settings          | ✅    | ✅      | ❌     | ❌
Assign board managers       | ✅    | ❌      | ❌     | ❌
View board analytics        | ✅    | ✅      | ❌     | ❌
Export board data           | ✅    | ✅      | ❌     | ❌

📌 GROUP PERMISSIONS
====================
Chức năng                    | Admin | Manager | Member | Viewer
---------------------------- |-------|---------|--------|--------
Tạo group                   | ✅    | ✅      | ❌     | ❌
Xóa group                   | ✅    | ✅      | ❌     | ❌
Sửa group settings          | ✅    | ✅      | ❌     | ❌
Archive group               | ✅    | ✅      | ❌     | ❌
Reorder groups              | ✅    | ✅      | ❌     | ❌

📌 TASK PERMISSIONS
===================
Chức năng                    | Admin | Manager | Member | Viewer
---------------------------- |-------|---------|--------|--------
Tạo task                    | ✅    | ✅      | ❌     | ❌
Xóa task                    | ✅    | ✅      | ❌***  | ❌
Sửa any task                | ✅    | ✅      | ❌     | ❌
Sửa assigned task           | ✅    | ✅      | ✅**** | ❌
Assign task                 | ✅    | ✅      | ❌     | ❌
Update task status          | ✅    | ✅      | ✅**** | ❌
Tạo subtasks                | ✅    | ✅      | ❌     | ❌
Move task between groups    | ✅    | ✅      | ❌     | ❌
Set task priority           | ✅    | ✅      | ✅**** | ❌
Set due dates               | ✅    | ✅      | ✅**** | ❌

📌 COMMENT PERMISSIONS
======================
Chức năng                    | Admin | Manager | Member | Viewer
---------------------------- |-------|---------|--------|--------
Add comment                 | ✅    | ✅      | ✅     | ❌
Edit own comment            | ✅    | ✅      | ✅     | ❌
Delete own comment          | ✅    | ✅      | ✅     | ❌
Delete any comment          | ✅    | ❌      | ❌     | ❌
Mention users               | ✅    | ✅      | ✅     | ❌
React to comments           | ✅    | ✅      | ✅     | ❌

📌 FILE/ATTACHMENT PERMISSIONS
==============================
Chức năng                    | Admin | Manager | Member | Viewer
---------------------------- |-------|---------|--------|--------
Upload files                | ✅    | ✅      | ✅     | ❌
Download files              | ✅    | ✅      | ✅     | ✅
Delete own files            | ✅    | ✅      | ✅     | ❌
Delete any files            | ✅    | ✅      | ❌     | ❌
Share files externally      | ✅    | ✅      | ❌     | ❌

📌 NOTIFICATION & SETTINGS
===========================
Chức năng                    | Admin | Manager | Member | Viewer
---------------------------- |-------|---------|--------|--------
Manage notifications        | ✅    | ✅      | ✅     | ✅
Export data                 | ✅    | ✅      | ❌     | ❌
View analytics              | ✅    | ✅      | ❌     | ❌
Access audit logs           | ✅    | ❌      | ❌     | ❌
Manage integrations         | ✅    | ❌      | ❌     | ❌

GHI CHÚ VÀ ĐIỀU KIỆN ĐặC BIỆT
==============================

* Manager chỉ remove được Members, không thể remove Admin
*** Member chỉ được xóa task do chính họ tạo
**** Member chỉ được thực hiện actions trên tasks được assign cho họ (không bao gồm tạo task mới)

NGUYÊN TẮC BẢO MẬT
==================

🔒 CORE SECURITY PRINCIPLES:

1. LEAST PRIVILEGE
   - Mỗi user chỉ có quyền tối thiểu cần thiết để thực hiện công việc

2. ROLE-BASED ACCESS
   - Permissions được gán theo role, không theo individual user

3. ADMIN PROTECTION  
   - Admin có quyền hạn cao nhất trong workspace
   - Mỗi workspace luôn phải có ít nhất 1 Admin

4. AUDIT TRAIL
   - Log tất cả thao tác quan trọng (tạo/xóa workspace, đổi role, v.v.)
   - Timestamp và user ID cho mọi action

5. VALIDATION LAYERS
   - Frontend validation (UX)
   - Backend validation (Security)
   - Database constraints (Data integrity)

IMPLEMENTATION GUIDELINES
=========================

🚀 PHASE 1: CORE MVP (2-3 weeks)
Workspace, Board, Group, Task basic permissions
Role assignment và checking
Basic UI permission hiding

🚀 PHASE 2: ENHANCED FEATURES (2-3 weeks)  
Comments system với permissions
File upload/download với access control
Advanced task management (subtasks, move, etc.)

🚀 PHASE 3: ADVANCED FEATURES (1-2 weeks)
Analytics và export với role restrictions
Audit logging system
Notification management
Advanced admin features

CODE STRUCTURE SUGGESTIONS
===========================

📁 RECOMMENDED FILE STRUCTURE
├── permissions/
│ ├── roles.js // Role definitions
│ ├── permissions.js // Permission matrix
│ ├── check.js // Permission checking functions
│ └── utils.js // Helper functions
├── components/
│ ├── PermissionGate.jsx // Wrapper component cho permission checking
│ ├── RoleIndicator.jsx // Display user roles
│ └── UserManagement.jsx // Manage workspace members
└── hooks/
├── usePermissions.js // Custom hook cho permission checking
└── useCurrentUser.js // Current user context


// Core permission checking
checkPermission(userId, workspaceId, resource, action)
getUserRole(userId, workspaceId)
canUserAccess(userId, resourceType, resourceId)

// Role management
assignRole(userId, workspaceId, role)
updateUserRole(userId, workspaceId, newRole)
removeUserFromWorkspace(userId, workspaceId)

// Workspace management
createWorkspace(adminId, workspaceName)
inviteToWorkspace(workspaceId, email, role)
getWorkspaceMembers(workspaceId)

// Audit logging
logAction(userId, action, resourceType, resourceId, metadata)
getAuditTrail(workspaceId, filters)