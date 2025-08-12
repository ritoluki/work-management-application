import React, { useState } from 'react';
import WorkspaceSelector from './WorkspaceSelector';
import BoardList from './BoardList';
import BoardForm from './BoardForm';

const Sidebar = ({
  collapsed,
  onToggleCollapse,
  workspaces,
  currentWorkspace,
  currentBoardId,
  currentUser,
  onSwitchWorkspace,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onBoardSelect,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
  workspaceDropdownRef
}) => {
  const [showAddBoard, setShowAddBoard] = useState(false);

  const handleCreateBoard = async (boardName) => {
    try {
      await onCreateBoard(boardName);
      setShowAddBoard(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <aside className={`transition-all duration-200 ${collapsed ? 'w-16' : 'w-72'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-600 h-full flex flex-col`}>
      {/* Workspace Selector */}
      <div className={`relative mb-4 px-4 pt-6 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-2 ${collapsed ? '' : 'w-full'}`}>
          <WorkspaceSelector
            ref={workspaceDropdownRef}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            currentUser={currentUser}
            onSwitchWorkspace={onSwitchWorkspace}
            onCreateWorkspace={onCreateWorkspace}
            onUpdateWorkspace={onUpdateWorkspace}
            onDeleteWorkspace={onDeleteWorkspace}
            onAddBoard={() => setShowAddBoard(true)}
            collapsed={collapsed}
          />
          
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-all"
              title="Collapse sidebar"
            >
              <span className="sr-only">Collapse sidebar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6l-6 6 6 6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Add Board Form */}
      {!collapsed && showAddBoard && (
        <div className="mb-4 mx-4">
          <BoardForm
            onSubmit={handleCreateBoard}
            onCancel={() => setShowAddBoard(false)}
          />
        </div>
      )}

      {/* Board List */}
      <div className={`space-y-2 px-4 flex-1 flex flex-col ${collapsed ? 'items-center' : ''}`}>
        {currentWorkspace?.boards && (
          <BoardList
            boards={currentWorkspace.boards}
            currentBoardId={currentBoardId}
            currentUser={currentUser}
            onBoardSelect={onBoardSelect}
            onUpdateBoard={onUpdateBoard}
            onDeleteBoard={onDeleteBoard}
            collapsed={collapsed}
          />
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="p-4 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-all rounded"
            title="Expand sidebar"
          >
            <span className="sr-only">Expand sidebar</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;