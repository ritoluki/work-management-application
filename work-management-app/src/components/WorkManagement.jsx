import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from "lucide-react";
import TaskGroup from './TaskGroup';
import UserDropdown from './UserDropdown';
import UserProfile from './UserProfile';
import AdminPanel from './AdminPanel';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';
import WorkspaceSelector from './ui/WorkspaceSelector';
import BoardList from './ui/BoardList';
import Sidebar from './ui/Sidebar';
import ErrorBoundary from './ui/ErrorBoundary';
import { NotificationProvider } from '../context/NotificationContext';
import { useWorkspace } from '../hooks/useWorkspace';
import { useBoard } from '../hooks/useBoard';
import { canDo, getPermissionDeniedMessage } from '../utils/permissions';
import { taskService } from '../services/taskService';

const WorkManagement = ({ user, onLogout }) => {
  // Use custom hooks for workspace and board management
  const workspaceHook = useWorkspace();
  const boardHook = useBoard();
  
  // Core state
  const [data, setData] = useState({ workspaces: [] });
  const [loading, setLoading] = useState(true);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(1);
  const [currentBoardId, setCurrentBoardId] = useState(1);
  const [currentUser, setCurrentUser] = useState(user);
  
  // UI state
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [searchFilter, setSearchFilter] = useState(null);
  const [allGroupsExpanded, setAllGroupsExpanded] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Load tasks for a specific group
  const loadTasksForGroup = useCallback(async (groupId) => {

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
      console.error('Error loading tasks for group:', err);
    }
  }, []);

  // Load groups and tasks for a board
  const loadGroupsAndTasks = useCallback(async (boardId) => {
    try {
      const groups = await boardHook.loadGroupsForBoard(boardId);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(ws => ({
          ...ws,
          boards: ws.boards.map(board => 
            board.id === boardId ? { ...board, groups } : board
          )
        }))
      }));
      
      // Load tasks for each group
      for (const group of groups) {
        await loadTasksForGroup(group.id);
      }
    } catch (error) {
      console.error('Error loading groups and tasks:', error);
    }
  }, [boardHook, loadTasksForGroup]);

  const currentWorkspace = data.workspaces.find(w => w.id === currentWorkspaceId);
  const currentBoard = currentWorkspace?.boards.find(b => b.id === currentBoardId);

  // Load workspaces when component mounts
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const workspaceData = await workspaceHook.loadWorkspaces();
        setData(workspaceData);
        
        // Load boards for first workspace
        if (workspaceData.workspaces.length > 0) {
          const firstWorkspace = workspaceData.workspaces[0];
          setCurrentWorkspaceId(firstWorkspace.id);
          
          const boards = await boardHook.loadBoardsForWorkspace(firstWorkspace.id);
          setData(prevData => ({
            ...prevData,
            workspaces: prevData.workspaces.map(ws => 
              ws.id === firstWorkspace.id ? { ...ws, boards } : ws
            )
          }));
          
          if (boards.length > 0) {
            setCurrentBoardId(boards[0].id);
            await loadGroupsAndTasks(boards[0].id);
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [workspaceHook, boardHook, loadGroupsAndTasks]);

  // Handle workspace operations using hooks
  const handleCreateWorkspace = async (name) => {
    try {
      const newWorkspace = await workspaceHook.createWorkspace(name, data.workspaces);
      setData(prevData => ({
        ...prevData,
        workspaces: [...prevData.workspaces, { ...newWorkspace, boards: [] }]
      }));
      return newWorkspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  const handleSwitchWorkspace = async (workspaceId) => {
    try {
      setCurrentWorkspaceId(workspaceId);
      
      const workspace = data.workspaces.find(w => w.id === workspaceId);
      if (workspace && workspace.boards.length === 0) {
        // Load boards for this workspace if not already loaded
        const boards = await boardHook.loadBoardsForWorkspace(workspaceId);

        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.map(ws => 
            ws.id === workspaceId ? { ...ws, boards } : ws
          )
        }));
        
        if (boards.length > 0) {
          setCurrentBoardId(boards[0].id);
          await loadGroupsAndTasks(boards[0].id);
        } else {
          setCurrentBoardId(null);
        }
      } else if (workspace?.boards.length > 0) {
        setCurrentBoardId(workspace.boards[0].id);
      } else {
        setCurrentBoardId(null);
      }
    } catch (error) {
      console.error('Error switching workspace:', error);
    }
  };

  const handleUpdateWorkspace = async (workspaceId, updates) => {
    try {
      const updatedWorkspace = await workspaceHook.updateWorkspace(workspaceId, updates);
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(ws => 
          ws.id === workspaceId ? { ...ws, ...updatedWorkspace } : ws
        )
      }));
      return updatedWorkspace;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      if (data.workspaces.length <= 1) {
        throw new Error('Cannot delete the last workspace');
      }
      
      await workspaceHook.deleteWorkspace(workspaceId);
      
      const remainingWorkspaces = data.workspaces.filter(w => w.id !== workspaceId);

      setData(prevData => ({
        ...prevData,
        workspaces: remainingWorkspaces
      }));
      
      // Switch to first remaining workspace
      if (remainingWorkspaces.length > 0) {
        await handleSwitchWorkspace(remainingWorkspaces[0].id);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;

    }
  };

  // Handle board operations using hooks
  const handleBoardSelect = async (boardId) => {
    setCurrentBoardId(boardId);
    await loadGroupsAndTasks(boardId);
  };

  const handleCreateBoard = async (workspaceId, name) => {
    try {
      const existingBoards = currentWorkspace?.boards || [];
      const newBoard = await boardHook.createBoard(workspaceId, name, existingBoards);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(ws => 
          ws.id === workspaceId 
            ? { ...ws, boards: [...ws.boards, { ...newBoard, groups: [] }] }
            : ws
        )
      }));
      
      return newBoard;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;

    }
  };

  const handleUpdateBoard = async (boardId, updates) => {
    try {
      const updatedBoard = await boardHook.updateBoard(boardId, updates);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => ({
          ...workspace,
          boards: workspace.boards.map(board => 
            board.id === boardId ? { ...board, ...updatedBoard } : board
          )
        }))
      }));
      
      return updatedBoard;
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      await boardHook.deleteBoard(boardId);
      
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => ({
          ...workspace,
          boards: workspace.boards.filter(board => board.id !== boardId)
        }))
      }));
      
      // Switch to first remaining board in current workspace
      const remainingBoards = currentWorkspace?.boards.filter(b => b.id !== boardId) || [];
      if (remainingBoards.length > 0) {
        setCurrentBoardId(remainingBoards[0].id);
        await loadGroupsAndTasks(remainingBoards[0].id);
      } else {
        setCurrentBoardId(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;

    }
  };

  // Utility handlers for UI interactions
  const handleSearchResult = (result) => {
    if (result.type === 'workspace') {
      handleSwitchWorkspace(result.item.id);
    } else if (result.type === 'board') {
      handleSwitchWorkspace(result.workspaceId);
      setTimeout(() => handleBoardSelect(result.item.id), 100);
    } else if (result.type === 'group' || result.type === 'task') {
      handleSwitchWorkspace(result.workspaceId);
      setTimeout(() => handleBoardSelect(result.boardId), 100);
    }
  };

  const handleSearchQueryChange = (query) => {
    setSearchFilter(query ? { query } : null);
  };

  const handleToggleAllGroups = () => {
    setAllGroupsExpanded(!allGroupsExpanded);
  };

  const handleShowUserProfile = () => {
    setShowUserProfile(true);
    setShowAdminPanel(false);
  };

  const handleShowAdminPanel = () => {
    setShowAdminPanel(true);
    setShowUserProfile(false);

  };

  const handleAddGroup = async () => {
    if (!canDo('CREATE_GROUP', currentUser.role)) {
      alert(getPermissionDeniedMessage('CREATE_GROUP', currentUser.role));
      return;
    }
    
    if (newGroupName.trim() && currentBoardId) {
      try {
        const response = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newGroupName,
            boardId: currentBoardId
          })
        });
        
        if (response.ok) {
          const newGroup = await response.json();
          setData(prevData => ({
            ...prevData,
            workspaces: prevData.workspaces.map(workspace => ({
              ...workspace,
              boards: workspace.boards.map(board => 
                board.id === currentBoardId 
                  ? { ...board, groups: [...board.groups, { ...newGroup, tasks: [] }] }
                  : board
              )
            }))
          }));
          
          setNewGroupName('');
          setShowAddGroup(false);
        }
      } catch (error) {
        console.error('Error creating group:', error);

        alert('Failed to create group');
      }
    }
  };

  // Group and task management handlers
  const handleUpdateGroup = async (updatedGroup) => {
    setData(prevData => ({
      ...prevData,
      workspaces: prevData.workspaces.map(workspace => ({
        ...workspace,
        boards: workspace.boards.map(board => ({
          ...board,
          groups: board.groups.map(group => 
            group.id === updatedGroup.id ? updatedGroup : group
          )
        }))
      }))
    }));

  };

  const handleDeleteGroup = async (groupId) => {
    if (!canDo('DELETE_GROUP', currentUser.role)) {
      alert(getPermissionDeniedMessage('DELETE_GROUP', currentUser.role));
      return;
    }
    
    try {
      const response = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
      if (response.ok) {
        setData(prevData => ({
          ...prevData,
          workspaces: prevData.workspaces.map(workspace => ({
            ...workspace,
            boards: workspace.boards.map(board => ({
              ...board,
              groups: board.groups.filter(group => group.id !== groupId)
            }))
          }))
        }));

      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleAddTask = async (groupId, task) => {
    try {
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => ({
          ...workspace,
          boards: workspace.boards.map(board => ({
            ...board,
            groups: board.groups.map(group => 
              group.id === groupId 
                ? { ...group, tasks: [...group.tasks, task] }
                : group
            )
          }))
        }))
      }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (groupId, updatedTask) => {
    try {
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => ({
          ...workspace,
          boards: workspace.boards.map(board => ({
            ...board,
            groups: board.groups.map(group => 
              group.id === groupId 
                ? { 
                    ...group, 
                    tasks: group.tasks.map(task => 
                      task.id === updatedTask.id ? updatedTask : task
                    ) 
                  }
                : group
            )
          }))
        }))

      }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (groupId, taskId) => {
    try {
      setData(prevData => ({
        ...prevData,
        workspaces: prevData.workspaces.map(workspace => ({
          ...workspace,
          boards: workspace.boards.map(board => ({
            ...board,
            groups: board.groups.map(group => 
              group.id === groupId 
                ? { ...group, tasks: group.tasks.filter(task => task.id !== taskId) }
                : group
            )
          }))
        }))
      }));
    } catch (error) {
      console.error('Error deleting task:', error);

    }
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
  if (workspaceHook.error || boardHook.error) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{workspaceHook.error || boardHook.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>

        </div>
      </ErrorBoundary>
    );
  }

  return (
    <NotificationProvider user={currentUser}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* Header */}
          <header className="flex items-center gap-2 px-4 py-2 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 sticky top-0 z-[1100] transition-colors duration-200">
            {/* Logo */}
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              WorkFlow
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <ErrorBoundary>
                <SearchBar 
                  data={data}
                  onResult={handleSearchResult}
                  onQueryChange={handleSearchQueryChange}
                  isAdminPanelOpen={showAdminPanel}
                />
              </ErrorBoundary>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <UserDropdown 
                user={currentUser}
                onShowProfile={handleShowUserProfile}
                onShowAdmin={handleShowAdminPanel}
                onLogout={onLogout}
              />
            </div>
          </header>

          <div className="flex">
            {/* Sidebar */}
            <ErrorBoundary>
              <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed}>
                {/* Workspace Selector */}
                <WorkspaceSelector
                  workspaces={data.workspaces}
                  currentWorkspace={currentWorkspace}
                  currentUser={currentUser}
                  onSwitchWorkspace={handleSwitchWorkspace}
                  onCreateWorkspace={handleCreateWorkspace}
                  onUpdateWorkspace={handleUpdateWorkspace}
                  onDeleteWorkspace={handleDeleteWorkspace}
                  collapsed={sidebarCollapsed}
                />

                {/* Board List */}
                {currentWorkspace && (
                  <BoardList
                    boards={currentWorkspace.boards}
                    currentBoardId={currentBoardId}
                    currentUser={currentUser}
                    onBoardSelect={handleBoardSelect}
                    onUpdateBoard={handleUpdateBoard}
                    onDeleteBoard={handleDeleteBoard}
                    collapsed={sidebarCollapsed}
                  />
                )}

                {/* Add Board Button */}
                {!sidebarCollapsed && canDo('CREATE_BOARD', currentUser.role) && (
                  <button
                    onClick={() => handleCreateBoard(currentWorkspaceId, 'New Board')}
                    className="flex items-center gap-2 px-3 py-2 mx-2 mt-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Plus size={16} />
                    Add Board
                  </button>
                )}
              </Sidebar>
            </ErrorBoundary>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {currentBoard ? (
                <ErrorBoundary>
                  <div className="space-y-6">
                    {/* Board Header */}
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentBoard.name}
                      </h1>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleToggleAllGroups}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          {allGroupsExpanded ? 'Collapse All' : 'Expand All'}
                        </button>
                        
                        {canDo('CREATE_GROUP', currentUser.role) && (
                          <button
                            onClick={() => setShowAddGroup(true)}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                          >
                            <Plus size={16} />
                            Add Group
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Groups */}
                    {currentBoard.groups?.map((group) => (
                      <TaskGroup
                        key={group.id}
                        group={group}
                        currentUser={currentUser}
                        onUpdate={handleUpdateGroup}
                        onDelete={handleDeleteGroup}
                        onAddTask={handleAddTask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        searchFilter={searchFilter}
                        expanded={allGroupsExpanded}
                      />
                    ))}

                    {/* Add Group Modal */}
                    {showAddGroup && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                          <h3 className="text-lg font-semibold mb-4">Add New Group</h3>

                          <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className="w-full p-2 border rounded mb-4"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setShowAddGroup(false)}
                              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddGroup}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Add Group
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Board Selected
                    </h2>
                    <p className="text-gray-500 dark:text-gray-500">
                      {currentWorkspace?.boards.length === 0 
                        ? 'Create a board to get started'
                        : 'Select a board from the sidebar'
                      }
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Modals */}
          {showUserProfile && (
            <ErrorBoundary>
              <UserProfile
                user={currentUser}
                onClose={() => setShowUserProfile(false)}
                onUpdateUser={setCurrentUser}
              />
            </ErrorBoundary>
          )}


          {showAdminPanel && (
            <ErrorBoundary>
              <AdminPanel
                onClose={() => setShowAdminPanel(false)}
                currentUser={currentUser}
              />
            </ErrorBoundary>
          )}
        </div>
      </ErrorBoundary>
    </NotificationProvider>
  );
};

export default WorkManagement;