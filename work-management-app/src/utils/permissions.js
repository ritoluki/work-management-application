// Permission matrix - defines what each role can do
export const PERMISSIONS = {
  // Workspace Management
  'CREATE_WORKSPACE': ['OWNER', 'ADMIN'], // ADMIN can also create workspace
  'DELETE_WORKSPACE': ['OWNER'], 
  'EDIT_WORKSPACE': ['OWNER', 'ADMIN'],
  'VIEW_WORKSPACE': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],
  
  // Board Management  
  'CREATE_BOARD': ['OWNER', 'ADMIN', 'MANAGER'],
  'DELETE_BOARD': ['OWNER', 'ADMIN'],
  'EDIT_BOARD': ['OWNER', 'ADMIN', 'MANAGER'],
  'ARCHIVE_BOARD': ['OWNER', 'ADMIN', 'MANAGER'],
  'VIEW_BOARD': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],
  
  // Group Management
  'CREATE_GROUP': ['OWNER', 'ADMIN', 'MANAGER'],
  'DELETE_GROUP': ['OWNER', 'ADMIN', 'MANAGER'],
  'EDIT_GROUP': ['OWNER', 'ADMIN', 'MANAGER'],
  'REORDER_GROUP': ['OWNER', 'ADMIN', 'MANAGER'],
  
  // Task Management - Updated according to new document
  'CREATE_TASK': ['OWNER', 'ADMIN', 'MANAGER'], // MEMBER removed
  'DELETE_TASK': ['OWNER', 'ADMIN', 'MANAGER'], // MEMBER can only delete own tasks (handled separately)
  'EDIT_TASK': ['OWNER', 'ADMIN', 'MANAGER'], // MEMBER can only edit assigned tasks (handled separately)
  'MOVE_TASK': ['OWNER', 'ADMIN', 'MANAGER'],
  'COMMENT_TASK': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER'],
  'ASSIGN_TASK': ['OWNER', 'ADMIN', 'MANAGER'],
  
  // User Management
  'INVITE_USER': ['OWNER', 'ADMIN', 'MANAGER'],
  'REMOVE_USER': ['OWNER', 'ADMIN', 'MANAGER'],
  'CHANGE_USER_ROLE': ['OWNER', 'ADMIN'],
  
  // Settings
  'VIEW_SETTINGS': ['OWNER', 'ADMIN', 'MANAGER'],
  'EDIT_SETTINGS': ['OWNER', 'ADMIN'],
  
  // Search & Navigation
  'USE_SEARCH': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],
  'SWITCH_WORKSPACE': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'],
  'SWITCH_BOARD': ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER']
};

// Main permission checker function
export const canDo = (action, userRole) => {
  if (!userRole || !action) return false;
  return PERMISSIONS[action]?.includes(userRole) || false;
};

// Helper function to check multiple permissions at once
export const canDoAny = (actions, userRole) => {
  return actions.some(action => canDo(action, userRole));
};

// Helper function to check all permissions
export const canDoAll = (actions, userRole) => {
  return actions.every(action => canDo(action, userRole));
};

// Get all permissions for a role
export const getPermissionsForRole = (role) => {
  const permissions = [];
  for (const [action, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(role)) {
      permissions.push(action);
    }
  }
  return permissions;
};

// Role hierarchy for easy comparisons
export const ROLE_HIERARCHY = {
  'ADMIN': 4,
  'MANAGER': 3,
  'MEMBER': 2,
  'VIEWER': 1
};

// Check if user role is higher than required role
export const hasRoleLevel = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Error messages for permission denied
export const getPermissionDeniedMessage = (action, userRole) => {
  const messages = {
    'CREATE_WORKSPACE': 'Chỉ Admin mới có thể tạo workspace!',
    'DELETE_WORKSPACE': 'Chỉ Admin mới có thể xóa workspace!',
    'EDIT_WORKSPACE': 'Chỉ Admin mới có thể sửa workspace!',
    'CREATE_BOARD': 'Bạn cần quyền Manager trở lên để tạo board!',
    'DELETE_BOARD': 'Chỉ Admin mới có thể xóa board!',
    'EDIT_BOARD': 'Bạn cần quyền Manager trở lên để sửa board!',
    'DELETE_GROUP': 'Bạn cần quyền Manager trở lên để xóa group!',
    'DELETE_TASK': 'Bạn cần quyền Manager trở lên để xóa task!',
    'EDIT_SETTINGS': 'Chỉ Admin mới có thể thay đổi settings!',
    'INVITE_USER': 'Chỉ Admin mới có thể mời user!',
  };
  
  return messages[action] || `Bạn không có quyền thực hiện hành động này! (Role: ${userRole})`;
}; 