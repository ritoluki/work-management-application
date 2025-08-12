import { useState, useEffect, useCallback } from 'react';

export const useSearch = (data, debounceMs = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback((searchQuery) => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const searchResults = [];

    // Search through all workspaces
    data.forEach(workspace => {
      workspace.boards.forEach(board => {
        // Search boards
        if (board.name.toLowerCase().includes(searchTerm)) {
          searchResults.push({
            type: 'board',
            id: board.id,
            title: board.name,
            subtitle: `Board in ${workspace.name}`,
            workspaceId: workspace.id,
            boardId: board.id,
            groupId: null,
            taskId: null
          });
        }

        // Search groups within boards
        board.groups.forEach(group => {
          if (group.name.toLowerCase().includes(searchTerm)) {
            searchResults.push({
              type: 'group',
              id: group.id,
              title: group.name,
              subtitle: `Group in ${board.name}`,
              workspaceId: workspace.id,
              boardId: board.id,
              groupId: group.id,
              taskId: null
            });
          }

          // Search tasks within groups
          group.tasks.forEach(task => {
            if (task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm))) {
              searchResults.push({
                type: 'task',
                id: task.id,
                title: task.title,
                subtitle: `Task in ${group.name}`,
                workspaceId: workspace.id,
                boardId: board.id,
                groupId: group.id,
                taskId: task.id
              });
            }
          });
        });
      });
    });

    return searchResults;
  }, [data]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        const searchResults = performSearch(query);
        setResults(searchResults);
        setIsSearching(false);
      } else {
        setResults([]);
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch
  };
};