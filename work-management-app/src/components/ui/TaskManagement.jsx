import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, Users } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { useAdminOperations } from '../../hooks/useAdminOperations';

const TaskManagement = () => {
  const adminOps = useAdminOperations();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskAssignModal, setShowTaskAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadWorkspaces = useCallback(async () => {
    try {
      const workspaceData = await adminOps.loadWorkspaces();
      setWorkspaces(workspaceData);
      if (workspaceData.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(workspaceData[0]);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  }, [adminOps, selectedWorkspace]);

  const loadBoards = useCallback(async (workspaceId) => {
    try {
      const boardData = await adminOps.loadBoards(workspaceId);
      setBoards(boardData);
      if (boardData.length > 0 && !selectedBoard) {
        setSelectedBoard(boardData[0]);
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
    }
  }, [adminOps, selectedBoard]);

  const loadTasks = useCallback(async (boardId) => {
    try {
      const taskData = await adminOps.loadTasks(boardId);
      setTasks(taskData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, [adminOps]);

  const loadUsers = useCallback(async () => {
    try {
      const userData = await adminOps.loadUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, [adminOps]);

  useEffect(() => {
    loadWorkspaces();
    loadUsers();
  }, [loadWorkspaces, loadUsers]);

  useEffect(() => {
    if (selectedWorkspace) {
      loadBoards(selectedWorkspace.id);
    }
  }, [selectedWorkspace, loadBoards]);

  useEffect(() => {
    if (selectedBoard) {
      loadTasks(selectedBoard.id);
    }
  }, [selectedBoard, loadTasks]);

  const handleAssignTask = async (taskId, userId) => {
    try {
      await adminOps.assignTask(taskId, userId);
      // Reload tasks to get updated data
      if (selectedBoard) {
        await loadTasks(selectedBoard.id);
      }
      setShowTaskAssignModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Task Management
          </h3>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace</label>
            <select
              value={selectedWorkspace?.id || ''}
              onChange={(e) => {
                const workspace = workspaces.find(w => w.id === parseInt(e.target.value));
                setSelectedWorkspace(workspace);
                setSelectedBoard(null);
                setTasks([]);
              }}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Workspace</option>
              {workspaces.map(workspace => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
            <select
              value={selectedBoard?.id || ''}
              onChange={(e) => {
                const board = boards.find(b => b.id === parseInt(e.target.value));
                setSelectedBoard(board);
              }}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={!selectedWorkspace}
            >
              <option value="">Select Board</option>
              {boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        {selectedBoard ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedTo ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6">
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                              {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                            </div>
                          </div>
                          <div className="ml-2">
                            {task.assignedTo.firstName} {task.assignedTo.lastName}
                          </div>
                        </div>
                      ) : (
                        'Unassigned'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskAssignModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Users className="w-4 h-4" />
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks found in this board
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select a workspace and board to view tasks
          </div>
        )}

        {/* Task Assignment Modal */}
        {showTaskAssignModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Assign Task</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Task: <strong>{selectedTask.title}</strong></p>
                <p className="text-sm text-gray-600">Current assignee: {selectedTask.assignedTo ? 
                  `${selectedTask.assignedTo.firstName} ${selectedTask.assignedTo.lastName}` : 
                  'Unassigned'}
                </p>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700">Select user to assign:</p>
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleAssignTask(selectedTask.id, user.id)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowTaskAssignModal(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignTask(selectedTask.id, null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Unassign
                </button>
              </div>
            </div>
          </div>
        )}

        {adminOps.loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {adminOps.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {adminOps.error}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TaskManagement;