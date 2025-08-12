import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useDropdownNavigation } from '../hooks/useDropdownNavigation';
import SearchDropdown from './ui/SearchDropdown';

const SearchBar = ({ data, onResult, onQueryChange, isAdminPanelOpen }) => {
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Use custom hooks for search functionality
  const { query, setQuery, results, clearSearch } = useSearch(data);
  
  // Handle dropdown navigation
  const {
    selectedIndex,
    handleKeyDown,
    resetSelection
  } = useDropdownNavigation(
    results,
    (result) => {
      onResult(result);
      clearSearch();
    },
    clearSearch
  );

  // Close search dropdown when admin panel opens
  useEffect(() => {
    if (isAdminPanelOpen) {
      clearSearch();
    }
  }, [isAdminPanelOpen, clearSearch]);

  // Notify parent about query changes
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query);
    }
  }, [query, onQueryChange]);

  // Reset selection when results change
  useEffect(() => {
    resetSelection();
  }, [results, resetSelection]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        clearSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearSearch]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (results.length > 0) {
      handleKeyDown(e);
    } else if (e.key === 'Escape') {
      clearSearch();
      searchInputRef.current?.blur();
    }
  };

  const handleResultClick = (result) => {
    onResult(result);
    clearSearch();
  };

  const isDropdownOpen = query.trim() && results.length >= 0;

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search boards, groups, and tasks..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                   transition-colors duration-200"
        />
      </div>

      {/* Search Results Dropdown */}
      <SearchDropdown
        isOpen={isDropdownOpen}
        results={results}
        selectedIndex={selectedIndex}
        query={query}
        onResultClick={handleResultClick}
        onClear={clearSearch}
        dropdownRef={dropdownRef}
      />
    </div>
  );
};

export default SearchBar;