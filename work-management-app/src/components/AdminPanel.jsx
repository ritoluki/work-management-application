import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, ClipboardList, Trash2, Edit3, Search, BarChart3 } from 'lucide-react';
import { userService } from '../services/userService';
import { workspaceService } from '../services/workspaceService';
import { boardService } from '../services/boardService';
import { taskService } from '../services/taskService';
import TaskStatistics from './TaskStatistics';

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskAssignModal, setShowTaskAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '',
    role: 'MEMBER' 
  });

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadWorkspaces();
  }, []);

  // Load boards when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      loadBoards(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  // Load tasks when board changes
  useEffect(() => {
    if (selectedBoard) {
      loadTasks(selectedBoard.id);
    }
  }, [selectedBoard]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const response = await workspaceService.getAllWorkspaces();
      const workspaceList = response.data || [];
      setWorkspaces(workspaceList);
      
      // Auto-select first workspace if available
      if (workspaceList.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(workspaceList[0]);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  };

  const loadBoards = async (workspaceId) => {
    try {
      const response = await boardService.getBoardsByWorkspace(workspaceId);
      const boardList = response.data || [];
      setBoards(boardList);
      
      // Auto-select first board if available
      if (boardList.length > 0 && !selectedBoard) {
        setSelectedBoard(boardList[0]);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadTasks = async (boardId) => {
    try {
      const response = await taskService.getTasksByBoard(boardId);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      await loadUsers(); // Reload users
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Lỗi khi cập nhật vai trò user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa user này?')) {
      try {
        await userService.deleteUser(userId);
        await loadUsers(); // Reload users
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Lỗi khi xóa user');
      }
    }
  };

  const handleTaskAssign = async (taskId, userId) => {
    try {
      await taskService.assignTask(taskId, userId);
      await loadTasks(selectedBoard.id); // Reload tasks
      setShowTaskAssignModal(false);
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Lỗi khi gán task cho user');
    }
  };

  const handleAddUser = async () => {
    try {
      // Prepare user data with proper field mapping
      const userData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        passwordHash: newUser.password, // Map password to passwordHash
        role: newUser.role
      };
      
      await userService.createUser(userData);
      await loadUsers(); // Reload users
      setShowAddUserModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'MEMBER' });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Lỗi khi tạo user mới');
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(task =>
    task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 2147483648 }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Quản lý nhân viên
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            Quản lý task
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'statistics'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Thống kê
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'users' && (
            <div>
              {/* Search bar */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm nhân viên
                </button>
              </div>

              {/* Users table */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nhân viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {user.email}
                        </td>
                        <td className="text-left px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 dark:bg-gray-600 dark:text-white bg-white text-gray-900"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MANAGER">Manager</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        </td>
                        <td className="text-left px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                            (user.active !== false) // Assume active if not explicitly false
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {(user.active !== false) ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              {/* Workspace and Board selection */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workspace
                  </label>
                  <select
                    value={selectedWorkspace?.id || ''}
                    onChange={(e) => {
                      const workspace = workspaces.find(w => w.id === parseInt(e.target.value));
                      setSelectedWorkspace(workspace);
                      setSelectedBoard(null);
                      setTasks([]);
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  >
                    <option value="">Chọn workspace...</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Board
                  </label>
                  <select
                    value={selectedBoard?.id || ''}
                    onChange={(e) => {
                      const board = boards.find(b => b.id === parseInt(e.target.value));
                      setSelectedBoard(board);
                    }}
                    disabled={!selectedWorkspace}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white bg-white text-gray-900 disabled:opacity-50"
                  >
                    <option value="">Chọn board...</option>
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search bar */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm task..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Tasks table */}
              {selectedBoard && (
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-6 py-4 text-left">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {task.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-300">
                                {task.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            {task.assignedToName ? (
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {task.assignedToName?.charAt(0)?.toUpperCase()}
                                </div>
                                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                  {task.assignedToName}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTaskAssignModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-sm"
                              >
                                Assign
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                              task.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {task.priority || 'Normal'}
                          </td>
                          <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskAssignModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div>
              <TaskStatistics />
            </div>
          )}
        </div>
      </div>

      {/* Task Assignment Modal */}
      {showTaskAssignModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 2147483649 }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Assign Task: {selectedTask.title}
            </h3>
            <div className="space-y-4">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleTaskAssign(selectedTask.id, user.id)}
                  className="w-full flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.firstName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="ml-3 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTaskAssignModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 2147483649 }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Thêm nhân viên mới
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-left block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Nhập họ"
                />
              </div>
              <div>
                <label className="text-left block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên
                </label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Nhập tên"
                />
              </div>
              <div>
                <label className="text-left block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="text-left block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                  placeholder="Nhập mật khẩu"
                />
              </div>
              <div>
                <label className="text-left block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vai trò
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
