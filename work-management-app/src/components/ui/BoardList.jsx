import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { canDo } from '../../utils/permissions';

const BoardList = ({
  boards,
  currentBoardId,
  currentUser,
  onBoardSelect,
  onUpdateBoard,
  onDeleteBoard,
  collapsed = false
}) => {
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState('');

  const handleEditBoard = (board) => {
    setEditingBoardId(board.id);
    setEditBoardName(board.name);
  };

  const handleSaveBoardName = async () => {
    if (editBoardName.trim()) {
      try {
        await onUpdateBoard(editingBoardId, { name: editBoardName.trim() });
      } catch (error) {
        console.error('Failed to update board:', error);
      }
    }
    setEditingBoardId(null);
    setEditBoardName('');
  };

  const handleCancelBoardEdit = () => {
    setEditingBoardId(null);
    setEditBoardName('');
  };

  const handleDeleteBoard = async (boardId) => {
    const confirmed = window.confirm('Are you sure you want to delete this board? This action cannot be undone.');
    if (confirmed) {
      try {
        await onDeleteBoard(boardId);
      } catch (error) {
        console.error('Failed to delete board:', error);
      }
    }
  };

  if (collapsed) {
    return (
      <div className="space-y-2 flex flex-col items-center">
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => onBoardSelect(board.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              board.id === currentBoardId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title={board.name}
          >
            {board.name.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {boards.map((board) => (
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
            <button
              onClick={() => onBoardSelect(board.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-between ${
                board.id === currentBoardId
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-sm font-medium truncate">
                {board.name}
              </span>
              
              {/* Action buttons for board management */}
              {canDo('UPDATE_BOARD', currentUser.role) && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBoard(board);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Edit board"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  
                  {canDo('DELETE_BOARD', currentUser.role) && boards.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(board.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete board"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default BoardList;