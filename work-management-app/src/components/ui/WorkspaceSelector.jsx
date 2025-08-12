import React, { useState, forwardRef } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { canDo } from '../utils/permissions';

const WorkspaceSelector = forwardRef(({
  workspaces,
  currentWorkspace,
  currentUser,
  onSwitchWorkspace,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onAddBoard,
  collapsed = false
}, ref) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleEditWorkspace = (workspace) => {
    setEditingWorkspaceId(workspace.id);
    setEditWorkspaceName(workspace.name);
  };

  const handleSaveWorkspaceName = async () => {
    if (editWorkspaceName.trim()) {
      try {
        await onUpdateWorkspace(editingWorkspaceId, { name: editWorkspaceName.trim() });
      } catch (error) {
        console.error('Failed to update workspace:', error);
      }
    }
    setEditingWorkspaceId(null);
    setEditWorkspaceName('');
  };

  const handleCancelWorkspaceEdit = () => {
    setEditingWorkspaceId(null);
    setEditWorkspaceName('');
  };

  const handleCreateWorkspace = async () => {
    if (newWorkspaceName.trim()) {
      try {
        await onCreateWorkspace(newWorkspaceName.trim());
        setNewWorkspaceName('');
        setShowAddWorkspace(false);
      } catch (error) {
        console.error('Failed to create workspace:', error);
      }
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    const confirmed = window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.');
    if (confirmed) {
      try {
        await onDeleteWorkspace(workspaceId);
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }
  };

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 bg-pink-400 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {currentWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={ref}>
      <div className="flex items-center gap-2 w-full">
        <div className="w-6 h-6 bg-pink-400 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {currentWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
          </span>
        </div>
        
        {/* Workspace Selector */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
        >
          <span className="text-gray-700 dark:text-white font-medium truncate">
            {currentWorkspace?.name}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Add Board Button */}
        {canDo('CREATE_BOARD', currentUser.role) && (
          <button
            onClick={onAddBoard}
            className="w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            title="Add board"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 mt-1">
          <div className="py-2">
            {/* Existing Workspaces */}
            {workspaces.map((workspace) => (
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
                  <div className={`w-full text-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    workspace.id === currentWorkspace?.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          onSwitchWorkspace(workspace.id);
                          setShowDropdown(false);
                        }}
                        className="flex-1 text-center"
                      >
                        {workspace.name}
                      </button>
                      
                      {/* Action buttons for workspace management */}
                      {canDo('UPDATE_WORKSPACE', currentUser.role) && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditWorkspace(workspace);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Edit workspace"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          
                          {canDo('DELETE_WORKSPACE', currentUser.role) && workspaces.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkspace(workspace.id);
                              }}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete workspace"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Workspace Section */}
            {canDo('CREATE_WORKSPACE', currentUser.role) && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                {showAddWorkspace ? (
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Workspace name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateWorkspace();
                        if (e.key === 'Escape') {
                          setShowAddWorkspace(false);
                          setNewWorkspaceName('');
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCreateWorkspace}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setShowAddWorkspace(false);
                          setNewWorkspaceName('');
                        }}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddWorkspace(true)}
                    className="w-full text-left px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                  >
                    + Add workspace
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

WorkspaceSelector.displayName = 'WorkspaceSelector';

export default WorkspaceSelector;