# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Work Management Application - A full-stack Kanban-style task management system with role-based access control (RBAC). The application follows a hierarchical structure: Workspace → Board → Group → Task.

**Tech Stack:**
- Frontend: React 19 + React Router + Ant Design + Tailwind CSS
- Backend: Spring Boot 3.5.4 + Spring Security + JPA/Hibernate + WebSocket
- Database: MySQL (dev on port 3308), PostgreSQL (production)
- Real-time: WebSocket via STOMP for notifications

## Development Commands

### Backend (Spring Boot)
```bash
cd work-management-backend

# Run the application (port 8080)
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=prod

# Build
./mvnw clean package

# Run tests
./mvnw test
```

### Frontend (React)
```bash
cd work-management-app

# Install dependencies
npm install

# Start dev server (port 3000)
npm start

# Build for production
npm build

# Run tests
npm test
```

### Database Setup
- MySQL dev: `localhost:3308`, database `work_management_db`, user `root`, no password
- Database auto-creates on startup via `createDatabaseIfNotExist=true`
- Schema auto-updates via `spring.jpa.hibernate.ddl-auto=update`

## Architecture & Key Concepts

### Entity Hierarchy
```
User
  └─ Workspace (owner relationship)
      └─ Board
          └─ Group
              └─ Task (assignedTo, createdBy relationships)
```

### RBAC Permission System
The application implements a strict 5-level role hierarchy (defined in `User.UserRole` enum):
1. **OWNER** (level 5) - Highest authority
2. **ADMIN** (level 4) - Full workspace management
3. **MANAGER** (level 3) - Can create/manage boards, groups, tasks
4. **MEMBER** (level 2) - Can only edit assigned tasks
5. **VIEWER** (level 1) - Read-only access

**Permission Logic** (see `PermissionService.java`):
- Task creation: OWNER, ADMIN, MANAGER only
- Task editing: OWNER/ADMIN/MANAGER can edit any task; MEMBER can only edit tasks assigned to them
- Task deletion: OWNER/ADMIN/MANAGER can delete any task; MEMBER can only delete tasks they created
- Frontend permissions: `utils/permissions.js` with `canDo()` function
- Backend enforcement: `PermissionService` validates all operations

**Critical Rule**: Always check permissions on BOTH frontend (UX) and backend (security). Frontend uses `canDo(action, role)`, backend uses `PermissionService` methods.

### Authentication Flow
- **No JWT tokens** - Security is currently disabled (`SecurityConfig.java` permits all requests)
- User data stored in `localStorage` (keys: `user`, `token`)
- Auth state managed in `App.js` via `RequireAuth` and `RedirectIfAuthed` route guards
- Login/Register via `AuthController` endpoints: `/api/auth/login`, `/api/auth/register`

### Real-time Notifications
- WebSocket configured in `WebSocketConfig.java`
- STOMP endpoint: `/ws`
- Subscribe to: `/topic/notifications/{userId}`
- Task events trigger notifications via `TaskNotificationEvent` and `NotificationService`
- Frontend: `NotificationContext` + `NotificationDropdown` component

### State Management Pattern
Frontend uses **local state + API sync** pattern (no Redux):
- Main state in `WorkManagement.jsx`: nested structure `{ workspaces: [{ boards: [{ groups: [{ tasks: [] }] }] }] }`
- Data loading is hierarchical: load workspaces → load boards → load groups → load tasks
- Updates are optimistic: update local state immediately, then sync with API
- Navigation syncs with URL: `/workspaces/:workspaceId/boards/:boardId`

### API Structure
All endpoints under `/api/`:
- `/api/auth/**` - Authentication (login, register)
- `/api/users/**` - User management
- `/api/workspaces/**` - Workspace CRUD
- `/api/boards/**` - Board CRUD (requires `workspaceId`)
- `/api/groups/**` - Group CRUD (requires `boardId`)
- `/api/tasks/**` - Task CRUD (requires `groupId`, `userId` for permission checks)
- `/api/notifications/**` - Notification management

**Important**: Task endpoints require `userId` parameter for permission validation (e.g., `POST /api/tasks?userId={userId}`).

## Common Patterns

### Adding a New Feature with Permissions
1. Define permission in `phanquyen.md` (Vietnamese permission spec document)
2. Add permission check to `utils/permissions.js` (frontend)
3. Add permission method to `PermissionService.java` (backend)
4. Use `canDo()` in React components to show/hide UI
5. Validate in controller using `PermissionService` before executing action

### Creating a New Entity
1. Create entity class in `entity/` with Lombok annotations (`@Data`, `@Entity`)
2. Add `@PrePersist` and `@PreUpdate` for timestamp management
3. Create repository interface extending `JpaRepository`
4. Create DTO class in `dto/` for API responses
5. Create service class with business logic
6. Create controller with REST endpoints
7. Add corresponding React service in `services/` (axios)

### Handling Cascading Deletes
Current behavior: **Prevent deletion if children exist**
- Workspace cannot be deleted if it has boards
- Board cannot be deleted if it has groups  
- Group cannot be deleted if it has tasks
- Backend returns error message, frontend shows alert

### Dark Mode Support
- Managed by `ThemeContext` provider
- All components use Tailwind dark mode classes: `dark:bg-gray-900`, `dark:text-white`
- Toggle via `ThemeToggle` component in header

## Important Files

- `phanquyen.md` - Complete Vietnamese specification of RBAC system (permission matrix, roles, rules)
- `SecurityConfig.java` - Spring Security configuration (currently permissive)
- `PermissionService.java` - Backend permission validation logic
- `utils/permissions.js` - Frontend permission checking
- `WorkManagement.jsx` - Main application component (1500+ lines, manages all state)
- `App.js` - Route configuration and auth guards
- `application.properties` - Database and server configuration

## Known Issues & Quirks

- Security is disabled in production - all API endpoints are public
- No JWT validation - authentication is client-side only via localStorage
- Task updates require `userId` parameter for permission checks (not extracted from session)
- Workspace dropdown stays open after actions - requires manual close
- Search filter persists from notifications - requires explicit clear
- Database uses `update` mode - schema changes auto-apply but may cause data loss

## Code Style Notes

- Backend: Uses Lombok extensively - avoid manual getters/setters
- Frontend: Functional components with hooks only (no class components)
- Error handling: Backend returns error messages in response body, frontend shows alerts
- Naming: Vietnamese UI text, English code/comments
- API responses: Return full DTOs, not entities (avoid lazy loading issues)
