import React, { useState } from 'react';

const BoardForm = ({ onSubmit, onCancel, placeholder = "Board name" }) => {
  const [boardName, setBoardName] = useState('');

  const handleSubmit = () => {
    if (boardName.trim()) {
      onSubmit(boardName.trim());
      setBoardName('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setBoardName('');
      onCancel();
    }
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          placeholder={placeholder}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            Add
          </button>
          <button
            onClick={() => {
              setBoardName('');
              onCancel();
            }}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardForm;