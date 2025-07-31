import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';

const SearchBar = ({ data, onResult, onQueryChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
      setSelectedIndex(-1);
      
      // Notify parent about query change
      onQueryChange && onQueryChange(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, data, onQueryChange]);

  // Perform search across all data
  const performSearch = (searchQuery) => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const searchResults = [];

    // Search through all workspaces
    data.forEach(workspace => {
      workspace.boards.forEach(board => {
        // Search boards
        if (board.name.toLowerCase().includes(searchTerm)) {
          searchResults.push({
            type: 'board',
            title: board.name,
            subtitle: `Board trong ${workspace.name}`,
            workspace: workspace.name,
            board: board.name,
            id: `board-${workspace.name}-${board.name}`
          });
        }

        // Search groups and tasks
        board.groups.forEach(group => {
          // Search groups
          if (group.name.toLowerCase().includes(searchTerm)) {
            searchResults.push({
              type: 'group',
              title: group.name,
              subtitle: `Group trong ${board.name} • ${workspace.name}`,
              workspace: workspace.name,
              board: board.name,
              group: group.name,
              id: `group-${workspace.name}-${board.name}-${group.name}`
            });
          }

          // Search tasks
          group.tasks.forEach(task => {
            if (
              task.name.toLowerCase().includes(searchTerm) ||
              (task.notes && task.notes.toLowerCase().includes(searchTerm))
            ) {
              searchResults.push({
                type: 'task',
                title: task.name,
                subtitle: `Task trong ${group.name} • ${board.name} • ${workspace.name}`,
                workspace: workspace.name,
                board: board.name,
                group: group.name,
                task: task,
                status: task.status,
                id: `task-${task.id}`
              });
            }
          });
        });
      });
    });

    // Sort results by relevance (exact matches first)
    searchResults.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(searchTerm);
      const bExact = b.title.toLowerCase().startsWith(searchTerm);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle result selection
  const handleSelectResult = (result) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    searchInputRef.current?.blur();
    onResult && onResult(result);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for result type
  const getResultIcon = (type) => {
    switch (type) {
      case 'task':
        return '📝';
      case 'group':
        return '📋';
      case 'board':
        return '📁';
      default:
        return '📄';
    }
  };

  // Get status color for tasks
  const getStatusColor = (status) => {
    switch (status) {
      case 'To-Do':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!searchInputRef.current) return {};
    
    const rect = searchInputRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  };

  const dropdownPosition = getDropdownPosition();

  return (
    <div className="relative flex-1 max-w-md mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Tìm kiếm..."
          className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 md:placeholder-opacity-100 placeholder-opacity-0"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setSelectedIndex(-1);
              onQueryChange && onQueryChange(''); // Clear filter when clearing search
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          className="search-dropdown-menu"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 2147483647,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '400px',
            overflowY: 'auto',
            transform: 'translateZ(0)'
          }}
        >
          <div className="py-2">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                Không tìm thấy kết quả
              </div>
            ) : (
              <>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-600">
                  {results.length} kết quả
                </div>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 flex-shrink-0">
                        {getResultIcon(result.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </span>
                          {result.type === 'task' && result.status && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(result.status)}`}>
                              {result.status}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {result.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SearchBar; 