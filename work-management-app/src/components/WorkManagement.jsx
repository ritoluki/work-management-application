import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Check, Search, X } from "lucide-react";
import TaskGroup from './TaskGroup';
import UserDropdown from './UserDropdown';
import UserProfile from './UserProfile';
import AdminPanel from './AdminPanel';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';
import { NotificationProvider } from '../context/NotificationContext';
import { canDo, getPermissionDeniedMessage } from '../utils/permissions';
import { getRoleBadge, getRoleIcon } from '../utils/mockUsers';
import { workspaceService } from '../services/workspaceService';
import { boardService } from '../services/boardService';
import { groupService } from '../services/groupService';
import { taskService } from '../services/taskService';

const WorkManagement = ({ user, onLogout }) => {
  const [data, setData] = useState({ workspaces: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(1);
  const [currentBoardId, setCurrentBoardId] = useState(1);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [searchFilter, setSearchFilter] = useState(null);
  const [allGroupsExpanded, setAllGroupsExpanded] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Workspace states
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const workspaceDropdownRef = useRef(null);
  
  // Edit/Delete states
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState('');

  const currentWorkspace = data.workspaces.find(w => w.id === currentWorkspaceId);
  const currentBoard = currentWorkspace?.boards.find(b => b.id === currentBoardId);

  // Load workspaces when component mounts
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Load tasks for current board when it changes
  useEffect(() => {
    const workspace = data.workspaces.find(w => w.id === currentWorkspaceId);
    const board = workspace?.boards.find(b => b.id === currentBoardId);
    
    if (currentBoardId && board && board.groups) {
      // Load tasks for all groups in the current board
      const loadAllTasksForCurrentBoard = async () => {
        for (const group of board.groups) {
          if (group.tasks.length === 0) { // Only load if not already loaded
            await loadTasksForGroup(group.id);
          }
        }
      };
      loadAllTasksForCurrentBoard();
    }
  }, [currentBoardId]);

  // đóng ws khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showWorkspaceDropdown && workspaceDropdownRef.current && 
          !workspaceDropdownRef.current.contains(event.target)) {
        setShowWorkspaceDropdown(false);
        setShowAddWorkspace(false);
        // Reset edit states when closing dropdown
        setEditingWorkspaceId(null);
        setEditWorkspaceName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWorkspaceDropdown]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.getAllWorkspaces();
      
      // Transform data để phù hợp với cấu trúc hiện tại
      const transformedData = {
        workspaces: response.data.map(workspace => ({
          ...workspace,
          boards: [] // Sẽ load boards sau
        }))
      };
      
      setData(transformedData);
      
      // Load boards cho workspace đầu tiên
      if (transformedData.workspaces.length > 0) {
        await loadBoardsForWorkspace(transformedData.workspaces[0].id);
      }
    } catch (err) {
      setError('Failed to load workspaces');
      console.error('Error loading workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBoardsForWorkspace = async (workspaceId) => {
    try {
      const response = await boardService.getBoardsByWorkspaceId(workspaceId);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => 
          workspace.id === workspaceId 
            ? { ...workspace, boards: response.data.map(board => ({ ...board, groups: [] })) }
            : workspace
        )
      }));
      
      // Load groups cho tất cả boards trong workspace này
      if (response.data.length > 0) {
        for (const board of response.data) {
          await loadGroupsForBoard(board.id);
        }
      }
    } catch (err) {
      console.error('Error loading boards:', err);
    }
  };

  const loadGroupsForBoard = async (boardId) => {
    try {
      const response = await groupService.getGroupsByBoardId(boardId);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => ({
          ...workspace,
          boards: workspace.boards.map(board => 
            board.id === boardId 
              ? { ...board, groups: response.data.map(group => ({ ...group, tasks: [] })) }
              : board
          )
        }))
      }));
      
      // Load tasks cho tất cả groups trong board này
      if (response.data.length > 0) {
        for (const group of response.data) {
          await loadTasksForGroup(group.id);
        }
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const loadTasksForGroup = async (groupId) => {
    try {
      const response = await taskService.getTasksByGroupId(groupId);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => ({
          ...workspace,
          boards: workspace.boards.map(board => ({
            ...board,
            groups: board.groups.map(group => 
              group.id === groupId 
                ? { ...group, tasks: response.data }
                : group
            )
          }))
        }))
      }));
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  const generateUniqueWorkspaceName = (proposedName) => {
    const baseName = proposedName.trim();
    const existingNames = data.workspaces.map(workspace => workspace.name);
    const existingNamesLowerCase = existingNames.map(name => name.toLowerCase());
    
    if (!existingNamesLowerCase.includes(baseName.toLowerCase())) {
      return baseName;
    }
    
      // Find the highest suffix number for this base name
    let counter = 2;
    let uniqueName = `${baseName} (${counter})`;
    
    while (existingNamesLowerCase.includes(uniqueName.toLowerCase())) {
      counter++;
      uniqueName = `${baseName} (${counter})`;
    }
    
    return uniqueName;
  };

  const handleAddWorkspace = async () => {
    // Permission check
    if (!canDo('CREATE_WORKSPACE', currentUser.role)) {
      alert(getPermissionDeniedMessage('CREATE_WORKSPACE', currentUser.role));
      return;
    }
    
    if (newWorkspaceName.trim()) {
      try {
        const uniqueName = generateUniqueWorkspaceName(newWorkspaceName);
        
        const response = await workspaceService.createWorkspace({
          name: uniqueName,
          description: '',
          ownerId: currentUser.id
        });
        
        setData(prevData => ({
          ...prevData,
          workspaces: [...prevData.workspaces, { ...response.data, boards: [] }]
        }));
        
        setNewWorkspaceName('');
        setShowAddWorkspace(false);
      } catch (err) {
        alert('Failed to create workspace');
        console.error(err);
      }
    }
  };

  const handleSwitchWorkspace = (workspaceId) => {
    setCurrentWorkspaceId(workspaceId);
    
    // chuyển sang board đầu tiên của workspace hoặc null nếu không có board
    const workspace = data.workspaces.find(w => w.id === workspaceId);
    const firstBoard = workspace?.boards?.[0];
    setCurrentBoardId(firstBoard?.id || null);
    
    setShowWorkspaceDropdown(false);
  };

  // ===== WORKSPACE DELETE/EDIT FUNCTIONS =====
  const handleDeleteWorkspace = async (workspaceId) => {
    // Permission check
    if (!canDo('DELETE_WORKSPACE', currentUser.role)) {
      alert(getPermissionDeniedMessage('DELETE_WORKSPACE', currentUser.role));
      return;
    }
    
    if (data.workspaces.length <= 1) {
      alert('Không thể xóa workspace cuối cùng!');
      return;
    }
    
    const workspace = data.workspaces.find(w => w.id === workspaceId);
    
    const confirmMessage = `Bạn có chắc muốn xóa workspace "${workspace?.name}"?\n\n` +
      `Hành động này không thể hoàn tác!`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await workspaceService.deleteWorkspace(workspaceId);
        
        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.filter(w => w.id !== workspaceId)
        }));
        
        // Switch to first remaining workspace
        const remainingWorkspaces = data.workspaces.filter(w => w.id !== workspaceId);
        if (remainingWorkspaces.length > 0) {
          const firstWorkspace = remainingWorkspaces[0];
          setCurrentWorkspaceId(firstWorkspace.id);
          setCurrentBoardId(firstWorkspace.boards?.[0]?.id || null);
        }
        
        setShowWorkspaceDropdown(false);
      } catch (err) {
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else if (err.message?.includes('chứa boards')) {
          alert('Không thể xóa workspace còn chứa boards. Vui lòng xóa tất cả boards trước.');
        } else {
          alert('Failed to delete workspace');
        }
        console.error(err);
      }
    }
  };

  const handleEditWorkspace = (workspaceId) => {
    // Permission check
    if (!canDo('EDIT_WORKSPACE', currentUser.role)) {
      alert(getPermissionDeniedMessage('EDIT_WORKSPACE', currentUser.role));
      return;
    }
    
    const workspace = data.workspaces.find(w => w.id === workspaceId);
    setEditingWorkspaceId(workspaceId);
    setEditWorkspaceName(workspace?.name || '');
  };

  const handleSaveWorkspaceName = async () => {
    if (!editWorkspaceName.trim()) {
      alert('Tên workspace không được để trống!');
      return;
    }
    
    const uniqueName = generateUniqueWorkspaceName(editWorkspaceName);
    
    try {
      // Gọi API để cập nhật workspace
      await workspaceService.updateWorkspace(editingWorkspaceId, {
        name: uniqueName
      });
      
      // Cập nhật state local
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace =>
          workspace.id === editingWorkspaceId
            ? { ...workspace, name: uniqueName }
            : workspace
        )
      }));
      
      setEditingWorkspaceId(null);
      setEditWorkspaceName('');
    } catch (err) {
      alert('Failed to update workspace');
      console.error(err);
    }
  };

  const handleCancelWorkspaceEdit = () => {
    setEditingWorkspaceId(null);
    setEditWorkspaceName('');
  };

  // ===== BOARD DELETE/EDIT FUNCTIONS =====
  const handleDeleteBoard = async (boardId) => {
    // Permission check
    if (!canDo('DELETE_BOARD', currentUser.role)) {
      alert(getPermissionDeniedMessage('DELETE_BOARD', currentUser.role));
      return;
    }
    
    const board = currentWorkspace?.boards.find(b => b.id === boardId);
    
    const confirmMessage = `Bạn có chắc muốn xóa board "${board?.name}"?\n\n` +
      `Hành động này không thể hoàn tác!`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await boardService.deleteBoard(boardId);
        
        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.map(workspace =>
            workspace.id === currentWorkspaceId
              ? {
                  ...workspace,
                  boards: workspace.boards.filter(board => board.id !== boardId)
                }
              : workspace
        )
      }));
      
      // Switch to first remaining board or null
      const remainingBoards = currentWorkspace?.boards.filter(b => b.id !== boardId);
      setCurrentBoardId(remainingBoards?.[0]?.id || null);
      } catch (err) {
        console.error('Delete board error:', err);
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else if (err.response?.data?.error) {
          alert(err.response.data.error);
        } else if (err.message?.includes('chứa groups')) {
          alert('Không thể xóa board còn chứa groups. Vui lòng xóa tất cả groups trước.');
        } else {
          alert('Failed to delete board');
        }
        console.error(err);
      }
    }
  };

  const handleEditBoard = (boardId) => {
    // Permission check
    if (!canDo('EDIT_BOARD', currentUser.role)) {
      alert(getPermissionDeniedMessage('EDIT_BOARD', currentUser.role));
      return;
    }
    
    const board = currentWorkspace?.boards.find(b => b.id === boardId);
    setEditingBoardId(boardId);
    setEditBoardName(board?.name || '');
  };

  const handleSaveBoardName = async () => {
    if (!editBoardName.trim()) {
      alert('Tên board không được để trống!');
      return;
    }
    
    const uniqueName = generateUniqueBoardName(editBoardName);
    
    try {
      // Gọi API để cập nhật board
      await boardService.updateBoard(editingBoardId, {
        name: uniqueName
      });
      
      // Cập nhật state local
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace =>
          workspace.id === currentWorkspaceId
            ? {
                ...workspace,
                boards: workspace.boards.map(board =>
                  board.id === editingBoardId
                    ? { ...board, name: uniqueName }
                    : board
                )
              }
            : workspace
        )
      }));
      
      setEditingBoardId(null);
      setEditBoardName('');
    } catch (err) {
      alert('Failed to update board');
      console.error(err);
    }
  };

  const handleCancelBoardEdit = () => {
    setEditingBoardId(null);
    setEditBoardName('');
  };

  const generateUniqueGroupName = (proposedName) => {
    const baseName = proposedName.trim();
    const existingNames = currentBoard?.groups.map(group => group.name) || [];
    const existingNamesLowerCase = existingNames.map(name => name.toLowerCase());
    
    if (!existingNamesLowerCase.includes(baseName.toLowerCase())) {
      return baseName;
    }
      
      // tìm số thứ tự cao nhất cho tên này
    let counter = 2;
    let uniqueName = `${baseName} (${counter})`;
    
    while (existingNamesLowerCase.includes(uniqueName.toLowerCase())) {
      counter++;
      uniqueName = `${baseName} (${counter})`;
    }
    
    return uniqueName;
  };

  const handleAddGroup = async () => {
    // Permission check
    if (!canDo('CREATE_GROUP', currentUser.role)) {
      alert(getPermissionDeniedMessage('CREATE_GROUP', currentUser.role));
      return;
    }
    
    if (newGroupName.trim()) {
      try {
        const uniqueName = generateUniqueGroupName(newGroupName);
        
        const response = await groupService.createGroup({
          name: uniqueName,
          color: 'blue',
          sortOrder: 0,
          boardId: currentBoardId,
          createdById: currentUser.id
        });
        
        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.map(workspace =>
            workspace.id === currentWorkspaceId
              ? {
                  ...workspace,
                  boards: workspace.boards.map(board =>
                    board.id === currentBoardId
                      ? { ...board, groups: [...board.groups, { ...response.data, tasks: [] }] }
                      : board
                  )
                }
              : workspace
        )
      }));
      
      setNewGroupName('');
      setShowAddGroup(false);
      } catch (err) {
        alert('Failed to create group');
        console.error(err);
      }
    }
  };

  const generateUniqueBoardName = (proposedName) => {
    const baseName = proposedName.trim();
    const existingNames = currentWorkspace?.boards.map(board => board.name) || [];
    const existingNamesLowerCase = existingNames.map(name => name.toLowerCase());
    
    if (!existingNamesLowerCase.includes(baseName.toLowerCase())) {
      return baseName;
    }
    
    // Find the highest suffix number for this base name
    let counter = 2;
    let uniqueName = `${baseName} (${counter})`;
    
    while (existingNamesLowerCase.includes(uniqueName.toLowerCase())) {
      counter++;
      uniqueName = `${baseName} (${counter})`;
    }
    
    return uniqueName;
  };

  const handleAddBoard = async () => {
    // Permission check
    if (!canDo('CREATE_BOARD', currentUser.role)) {
      alert(getPermissionDeniedMessage('CREATE_BOARD', currentUser.role));
      return;
    }
    
    if (newBoardName.trim()) {
      try {
        const uniqueName = generateUniqueBoardName(newBoardName);
        
        const response = await boardService.createBoard({
          name: uniqueName,
          description: '',
          color: 'blue',
          workspaceId: currentWorkspaceId,
          createdById: currentUser.id
        });
        
        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.map(workspace =>
            workspace.id === currentWorkspaceId
              ? { ...workspace, boards: [...workspace.boards, { ...response.data, groups: [] }] }
              : workspace
        )
      }));
      
      setNewBoardName('');
      setShowAddBoard(false);
      // Chuyển sang bảng mới
      setCurrentBoardId(response.data.id);
      } catch (err) {
        alert('Failed to create board');
        console.error(err);
      }
    }
  };

  const handleUpdateGroup = async (updatedGroup) => {
    try {
      // Gọi API để cập nhật group
      await groupService.updateGroup(updatedGroup.id, {
        name: updatedGroup.name,
        color: updatedGroup.color,
        sortOrder: updatedGroup.sortOrder
      });
      
      // Cập nhật state local
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace =>
          workspace.id === currentWorkspaceId
            ? {
                ...workspace,
                boards: workspace.boards.map(board =>
                  board.id === currentBoardId
                    ? {
                        ...board,
                        groups: board.groups.map(group =>
                          group.id === updatedGroup.id ? updatedGroup : group
                        )
                      }
                    : board
                )
              }
            : workspace
        )
      }));
    } catch (err) {
      alert('Failed to update group');
      console.error(err);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhóm này cùng với tất cả các task trong nhóm này không?')) {
      try {
        await groupService.deleteGroup(groupId);
        
        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.map(workspace =>
            workspace.id === currentWorkspaceId
              ? {
                  ...workspace,
                  boards: workspace.boards.map(board =>
                    board.id === currentBoardId
                      ? { ...board, groups: board.groups.filter(group => group.id !== groupId) }
                      : board
                  )
                }
              : workspace
        )
      }));
      } catch (err) {
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else if (err.message?.includes('chứa tasks')) {
          alert('Không thể xóa group còn chứa tasks. Vui lòng xóa tất cả tasks trước.');
        } else {
          alert('Failed to delete group');
        }
        console.error(err);
      }
    }
  };

  const handleAddTask = async (groupId, task) => {
    if (!canDo('CREATE_TASK', currentUser.role)) {
      alert(getPermissionDeniedMessage('CREATE_TASK', currentUser.role));
      return;
    }
    
    try {
      const response = await taskService.createTask({
        ...task,
        groupId: groupId,
        createdById: currentUser.id
      }, currentUser.id);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace =>
          workspace.id === currentWorkspaceId
            ? {
                ...workspace,
                boards: workspace.boards.map(board =>
                  board.id === currentBoardId
                    ? {
                        ...board,
                        groups: board.groups.map(group =>
                          group.id === groupId
                            ? { ...group, tasks: [...group.tasks, response.data] }
                            : group
                        )
                      }
                    : board
                )
              }
            : workspace
        )
      }));
    } catch (err) {
      alert('Failed to create task');
      console.error(err);
    }
  };

  const handleUpdateTask = async (groupId, updatedTask) => {
    try {
      console.log('Updating task with data:', updatedTask);
      const response = await taskService.updateTask(updatedTask.id, updatedTask, currentUser.id);
      console.log('Update response:', response.data);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace =>
          workspace.id === currentWorkspaceId
            ? {
                ...workspace,
                boards: workspace.boards.map(board =>
                  board.id === currentBoardId
                    ? {
                        ...board,
                        groups: board.groups.map(group =>
                          group.id === groupId
                            ? {
                                ...group,
                                tasks: group.tasks.map(task =>
                                  task.id === updatedTask.id ? response.data : task
                                )
                              }
                            : group
                        )
                      }
                    : board
                )
              }
            : workspace
        )
      }));
    } catch (err) {
      console.error('Error updating task:', err);
      console.error('Error response:', err.response?.data);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (groupId, taskId) => {
    if (window.confirm('Bạn có chắc muốn xóa task này ?')) {
      try {
        await taskService.deleteTask(taskId, currentUser.id);
        
        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.map(workspace =>
            workspace.id === currentWorkspaceId
              ? {
                  ...workspace,
                  boards: workspace.boards.map(board =>
                    board.id === currentBoardId
                      ? {
                          ...board,
                          groups: board.groups.map(group =>
                            group.id === groupId
                              ? { ...group, tasks: group.tasks.filter(task => task.id !== taskId) }
                              : group
                          )
                        }
                      : board
                  )
                }
              : workspace
          )
        }));
      } catch (err) {
        alert('Failed to delete task');
        console.error(err);
      }
    }
  };

  // Xử lý kết quả tìm kiếm
  const handleSearchResult = (result) => {
    // Tìm và chuyển đến kết quả
    const workspace = data.workspaces.find(w => w.name === result.workspace);
    if (!workspace) return;

    const board = workspace.boards.find(b => b.name === result.board);
    if (!board) return;

    // Chuyển đến workspace và board
    setCurrentWorkspaceId(workspace.id);
    setCurrentBoardId(board.id);

    // Đặt bộ lọc tìm kiếm dựa trên loại kết quả
    if (result.type === 'task') {

      setSearchFilter({
        type: 'task',
        taskId: result.task.id,
        groupName: result.group,
        searchTerm: result.title.toLowerCase()
      });
    } else if (result.type === 'group') {
      setSearchFilter({
        type: 'group',
        groupName: result.group,
        searchTerm: result.title.toLowerCase()
      });
    } else if (result.type === 'board') {
      // Đối với tìm kiếm bảng, hiển thị tất cả nội dung (không cần lọc)
      setSearchFilter(null);
    }
  };

  // Xử lý thay đổi trong thanh tìm kiếm (để xóa bộ lọc)
  const handleSearchQueryChange = (query) => {
    // Không clear filter nếu nó được set từ notification và user chưa search gì khác
    if (searchFilter?.fromNotification && (!query || query.trim() === '')) {
      return; // Giữ nguyên filter từ notification
    }
    
    if (!query || query.trim() === '') {
      // Xóa bộ lọc khi tìm kiếm trống
      setSearchFilter(null);
    }
  };

  // Xử lý thu gọn/mở rộng tất cả các nhóm
  const handleToggleAllGroups = () => {
    setAllGroupsExpanded(!allGroupsExpanded);
  };

  // Xử lý điều hướng profile người dùng
  const handleShowUserProfile = () => {
    setShowUserProfile(true);
  };

  // Xử lý điều hướng đến task từ thông báo
  const handleNavigateToTask = async (navigationData) => {
    if (!navigationData) return;
    
    console.log('Navigating to task:', navigationData);
    
    // Tìm workspace theo tên
    const targetWorkspace = data.workspaces.find(w => 
      w.name === navigationData.workspaceName
    );
    
    if (!targetWorkspace) {
      alert(`Không tìm thấy workspace "${navigationData.workspaceName}"`);
      return;
    }
    
    // Tìm board theo tên
    const targetBoard = targetWorkspace.boards.find(b => 
      b.name === navigationData.boardName
    );
    
    if (!targetBoard) {
      alert(`Không tìm thấy board "${navigationData.boardName}" trong workspace "${navigationData.workspaceName}"`);
      return;
    }
    
    // Chuyển đến workspace và board trước
    setCurrentWorkspaceId(targetWorkspace.id);
    setCurrentBoardId(targetBoard.id);
    
    // Mở rộng tất cả groups để user có thể thấy task
    setAllGroupsExpanded(true);
    
    // Đặt search filter với delay để đảm bảo data đã load xong
    setTimeout(() => {
      if (navigationData.taskId && navigationData.groupName) {
        console.log('Setting search filter for task:', navigationData.taskId);
        setSearchFilter({
          type: 'task',
          taskId: navigationData.taskId,
          groupName: navigationData.groupName,
          searchTerm: navigationData.taskName?.toLowerCase() || '',
          // Thêm flag để biết đây là từ notification
          fromNotification: true
        });
      }
    }, 1000); // Delay 1 giây để đảm bảo data đã load
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadWorkspaces}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Mảng màu cho icon project
  const boardColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];

  return (
    <NotificationProvider user={currentUser}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-2 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 sticky top-0 z-[1100] transition-colors duration-200">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          {/* Tên app: Ẩn trên mobile, chỉ hiện trên md trở lên */}
          <span className="font-semibold text-lg text-gray-800 dark:text-white hidden md:inline">work management</span>
        </div>
        {/* Thanh search: kéo dài trên mobile */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
            <SearchBar
              data={data.workspaces}
              onResult={handleSearchResult}
              onQueryChange={handleSearchQueryChange}
              isAdminPanelOpen={showAdminPanel}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getRoleBadge(currentUser.role)}`}>
            <span>{getRoleIcon(currentUser.role)}</span>
            <span>{currentUser.role}</span>
          </div>
          
          {/* Notification Bell */}
          <NotificationDropdown onNavigateToTask={handleNavigateToTask} />
          
          <ThemeToggle />
          <UserDropdown 
            user={currentUser} 
            onLogout={onLogout} 
            onShowUserProfile={handleShowUserProfile}
            onShowAdminPanel={() => setShowAdminPanel(true)}
          />
        </div>
      </header>

      {/* Filter Indicator */}
      {searchFilter && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Search className="w-4 h-4" />
              <span>
                {searchFilter.fromNotification ? (
                  <>
                    Đang xem task: <span className="font-medium">"{searchFilter.taskName}"</span>
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                      từ thông báo
                    </span>
                  </>
                ) : (
                  <>
                    Đang lọc task: <span className="font-medium">"{searchFilter.taskName}"</span>
                  </>
                )}
              </span>
            </div>
            <button
              onClick={() => setSearchFilter(null)}
              className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
            >
              <X className="w-4 h-4" />
              {searchFilter.fromNotification ? 'Trở về board' : 'Xóa bộ lọc'}
            </button>
          </div>
        </div>
      )}

      <div className={`flex relative ${searchFilter ? 'h-[calc(100vh-120px)]' : 'h-screen'}`}>
        {/* Sidebar */}
        <aside className={`transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-600 h-full flex flex-col`}>
          {/* Workspace dropdown + plus + collapse button */}
          <div className={`relative mb-4 px-4 pt-6 ${sidebarCollapsed ? 'flex justify-center' : ''}`} ref={workspaceDropdownRef}>
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? '' : 'w-full'}`}>
              <div className="w-6 h-6 bg-pink-400 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {currentWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
                </span>
              </div>
              
              {!sidebarCollapsed && (
                <>
                  {/* Workspace Selector */}
                  <button
                    onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                    className="flex items-center gap-2 flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
                  >
                    <span className="text-gray-700 dark:text-white font-medium truncate">
                      {currentWorkspace?.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showWorkspaceDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Add Board Button - only for users with permission */}
                  {canDo('CREATE_BOARD', currentUser.role) && (
                    <button
                      onClick={() => setShowAddBoard(true)}
                      className="w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                      title="Add board"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}

                  {/* Collapse/Expand button */}
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-all"
                    title="Thu gọn sidebar"
                  >
                    <span className="sr-only">Collapse sidebar</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6l-6 6 6 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Workspace Dropdown */}
            {!sidebarCollapsed && showWorkspaceDropdown && (
              <div className="absolute top-full left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 mt-1">
                <div className="py-2">
                  {/* Current Workspaces */}
                  {data.workspaces.map((workspace) => (
                    <div key={workspace.id} className="group relative">
                      {editingWorkspaceId === workspace.id ? (
                        /* Edit Mode */
                        <div className="px-4 py-2">
                          <input
                            type="text"
                            value={editWorkspaceName}
                            onChange={(e) => setEditWorkspaceName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveWorkspaceName();
                              if (e.key === 'Escape') handleCancelWorkspaceEdit();
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleSaveWorkspaceName}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelWorkspaceEdit}
                              className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div 
                          className={`w-full text-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            workspace.id === currentWorkspaceId 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleSwitchWorkspace(workspace.id)}
                              className="flex-1 text-center"
                            >
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-4 h-4 bg-pink-400 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {workspace.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-medium">{workspace.name}</span>
                                {workspace.id === currentWorkspaceId && (
                                  <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {workspace.boards.length} board{workspace.boards.length !== 1 ? 's' : ''}
                              </div>
                            </button>
                            
                            {/* Edit/Delete Actions - based on permissions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canDo('EDIT_WORKSPACE', currentUser.role) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditWorkspace(workspace.id);
                                  }}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                  title="Edit workspace name"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>
                              )}
                              {canDo('DELETE_WORKSPACE', currentUser.role) && data.workspaces.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWorkspace(workspace.id);
                                  }}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete workspace"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Workspace - only for users with permission */}
                  {canDo('CREATE_WORKSPACE', currentUser.role) && (
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                      {showAddWorkspace ? (
                        <div className="px-4 py-2">
                          <input
                            type="text"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Workspace name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddWorkspace()}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleAddWorkspace}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowAddWorkspace(false)}
                              className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddWorkspace(true)}
                          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add workspace</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Add board form */}
          {!sidebarCollapsed && showAddBoard && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mx-4">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBoard()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddBoard}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddBoard(false)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Danh sách project/board + nút mở sidebar (nếu collapse) */}
          <div className={`space-y-2 px-4 flex-1 flex flex-col ${sidebarCollapsed ? 'items-center' : ''}`}> 
            {currentWorkspace?.boards.map((board, idx) => (
              <div key={board.id} className="group relative">
                {editingBoardId === board.id ? (
                  /* Edit Mode */
                  <div className="px-2 py-2">
                    <input
                      type="text"
                      value={editBoardName}
                      onChange={(e) => setEditBoardName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveBoardName();
                        if (e.key === 'Escape') handleCancelBoardEdit();
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveBoardName}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelBoardEdit}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors duration-200 ${
                      board.id === currentBoardId 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <div
                      onClick={() => setCurrentBoardId(board.id)}
                      className="flex items-center gap-2 flex-1"
                    >
                      {/* Icon đại diện cho project/board, mỗi project 1 màu khác nhau */}
                      <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${boardColors[idx % boardColors.length]}`}></div>
                      {/* Luôn hiển thị tên project, nếu quá dài thì sẽ bị cắt ngắn (truncate) và hiện đầy đủ khi hover */}
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium truncate max-w-[120px]" title={board.name}>{board.name}</span>
                      )}
                    </div>
                    
                    {/* Edit/Delete Actions - based on permissions */}
                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canDo('EDIT_BOARD', currentUser.role) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBoard(board.id);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Edit board name"
                          >
                            <Edit2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                        {canDo('DELETE_BOARD', currentUser.role) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBoard(board.id);
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete board"
                          >
                            <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Khi sidebar thu gọn, hiện tooltip tên project khi hover vào icon */}
                    {sidebarCollapsed && (
                      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                        {board.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {/* Nút mở sidebar - ngay dưới project cuối cùng, không có vòng tròn, luôn cố định */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-all rounded mt-2"
                style={{ border: 'none', background: 'none' }}
                title="Mở rộng sidebar"
              >
                <span className="sr-only">Expand sidebar</span>
                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6l-6 6 6 6" />
                </svg>
              </button>
            )}
          </div>
        </aside>
        {/* Main Content */}
        <main className="main-content flex-1 p-6 bg-gray-50 dark:bg-gray-800 h-full overflow-y-auto transition-colors duration-200">
          {currentBoard ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{currentBoard.name}</h1>
                  <button
                    onClick={handleToggleAllGroups}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                    title={allGroupsExpanded ? "Thu gọn tất cả các nhóm" : "Mở rộng tất cả các nhóm"}
                  >
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${allGroupsExpanded ? '' : 'rotate-180'}`} />
                  </button>
                  {searchFilter && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-700">
                      🔍 Đang lọc: {searchFilter.type === 'task' ? 'Task' : 'Nhóm'}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Empty Workspace State */}
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                    Chào mừng đến với {currentWorkspace?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 text-base leading-relaxed">
                    {canDo('CREATE_BOARD', currentUser.role) 
                      ? "Workspace này đang trống. Tạo board đầu tiên để bắt đầu tổ chức dự án và công việc của bạn."
                      : "Workspace này đang trống. Liên hệ Admin hoặc Manager để tạo board mới."
                    }
                  </p>
                  {canDo('CREATE_BOARD', currentUser.role) ? (
                    <button
                      onClick={() => setShowAddBoard(true)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      Tạo board đầu tiên
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-8 py-4 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-xl font-semibold text-base">
                      <span>🔒</span>
                      Không có quyền tạo board
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {currentBoard && (
            <>

          {/* Task Groups */}
          {currentBoard?.groups
            .filter(group => {
              // Áp dụng bộ lọc tìm kiếm
              if (!searchFilter) return true;
              
              if (searchFilter.type === 'group') {
                return group.name === searchFilter.groupName;
              }
              
              if (searchFilter.type === 'task') {
                // Chỉ hiển thị các nhóm chứa task được lọc
                return group.tasks.some(task => task.id === searchFilter.taskId);
              }
              
              return true;
            })
            .map((group) => (
            <TaskGroup
              key={group.id}
              group={group}
              allGroups={currentBoard?.groups || []}
              searchFilter={searchFilter}
              isExpanded={allGroupsExpanded}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              currentUser={currentUser}
            />
          ))}

          {/* Add new group - only for users with permission */}
          {canDo('CREATE_GROUP', currentUser.role) && (
            <>
              {showAddGroup ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                      autoFocus
                    />
                    <button
                      onClick={handleAddGroup}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddGroup(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add new group
                </button>
              )}
            </>
          )}
            </>
          )}
        </main>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile 
          user={currentUser} 
          onClose={() => setShowUserProfile(false)}
          onUpdateUser={setCurrentUser}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} currentUser={currentUser} />
      )}
      </div>
    </NotificationProvider>
  );
};

export default WorkManagement;