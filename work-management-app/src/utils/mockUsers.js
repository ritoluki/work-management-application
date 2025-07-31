// Demo accounts for testing different permission levels
export const DEMO_ACCOUNTS = {
  admin: {
    id: 1,
    firstName: "Admin",
    lastName: "User", 
    email: "admin@demo.com",
    password: "123456",
    role: "ADMIN",
    avatar: null,
    description: "Có toàn quyền quản lý workspace, board, và user"
  },
  
  manager: {
    id: 2,
    firstName: "Manager",
    lastName: "User",
    email: "manager@demo.com", 
    password: "123456",
    role: "MANAGER",
    avatar: null,
    description: "Có thể tạo/sửa board và task, không thể xóa workspace"
  },
  
  member: {
    id: 3,
    firstName: "Member", 
    lastName: "User",
    email: "member@demo.com",
    password: "123456", 
    role: "MEMBER",
    avatar: null,
    description: "Có thể tạo/sửa task, không thể xóa board"
  },
  
  viewer: {
    id: 4,
    firstName: "Viewer",
    lastName: "User", 
    email: "viewer@demo.com",
    password: "123456",
    role: "VIEWER", 
    avatar: null,
    description: "Chỉ có thể xem, không thể chỉnh sửa"
  }
};

// Helper functions for UI styling
export const getRoleColor = (role) => {
  const colors = {
    'ADMIN': 'border-red-300 bg-red-50 hover:bg-red-100 shadow-sm',
    'MANAGER': 'border-blue-300 bg-blue-50 hover:bg-blue-100 shadow-sm', 
    'MEMBER': 'border-green-300 bg-green-50 hover:bg-green-100 shadow-sm',
    'VIEWER': 'border-gray-300 bg-gray-50 hover:bg-gray-100 shadow-sm'
  };
  return colors[role] || '';
};

export const getRoleBadge = (role) => {
  const badges = {
    'ADMIN': 'bg-red-500 text-white',
    'MANAGER': 'bg-blue-500 text-white',
    'MEMBER': 'bg-green-500 text-white', 
    'VIEWER': 'bg-gray-500 text-white'
  };
  return badges[role] || '';
};

// Role icons
export const getRoleIcon = (role) => {
  const icons = {
    'ADMIN': '👑',
    'MANAGER': '🔧',
    'MEMBER': '👤',
    'VIEWER': '👁️'
  };
  return icons[role] || '👤';
}; 