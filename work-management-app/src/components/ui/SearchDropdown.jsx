import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SearchDropdown = ({ 
  isOpen, 
  results, 
  selectedIndex,
  query,
  onResultClick,
  onClear,
  dropdownRef 
}) => {
  if (!isOpen) return null;

  const getResultIcon = (type) => {
    switch (type) {
      case 'board':
        return '📋';
      case 'group':
        return '📁';
      case 'task':
        return '✓';
      default:
        return '🔍';
    }
  };

  const getResultTypeColor = (type) => {
    switch (type) {
      case 'board':
        return 'text-blue-600 dark:text-blue-400';
      case 'group':
        return 'text-green-600 dark:text-green-400';
      case 'task':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const dropdown = (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-[9999] max-h-96 overflow-y-auto"
    >
      {/* Search query display */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </span>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search results */}
      <div className="py-2">
        {results.length > 0 ? (
          results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => onResultClick(result)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{getResultIcon(result.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {result.title}
                  </div>
                  <div className={`text-sm ${getResultTypeColor(result.type)} capitalize`}>
                    {result.subtitle}
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getResultTypeColor(result.type)} bg-opacity-10`}>
                  {result.type}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm">No results found</div>
            <div className="text-xs mt-1">Try searching for boards, groups, or tasks</div>
          </div>
        )}
      </div>
    </div>
  );

  // Render dropdown using portal to ensure it appears above other elements
  return createPortal(dropdown, document.body);
};

export default SearchDropdown;