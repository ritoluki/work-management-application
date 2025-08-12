import { useState, useCallback } from 'react';
import { boardService } from '../services/boardService';
import { groupService } from '../services/groupService';

export const useBoard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateUniqueBoardName = useCallback((proposedName, existingBoards) => {
    let baseName = proposedName.trim();
    if (!baseName) baseName = "New Board";
    
    let counter = 0;
    let finalName = baseName;
    
    while (existingBoards.some(b => b.name === finalName)) {
      counter++;
      finalName = `${baseName} (${counter})`;
    }
    
    return finalName;
  }, []);

  const loadBoardsForWorkspace = useCallback(async (workspaceId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardService.getBoardsByWorkspaceId(workspaceId);
      return response.data.map(board => ({ ...board, groups: [] }));
    } catch (err) {
      setError('Failed to load boards');
      console.error('Error loading boards:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGroupsForBoard = useCallback(async (boardId) => {
    try {
      const response = await groupService.getGroupsByBoardId(boardId);
      return response.data.map(group => ({ ...group, tasks: [] }));
    } catch (err) {
      console.error('Error loading groups:', err);
      throw err;
    }
  }, []);

  const createBoard = useCallback(async (workspaceId, name, existingBoards) => {
    try {
      setLoading(true);
      setError(null);
      const uniqueName = generateUniqueBoardName(name, existingBoards);
      const response = await boardService.createBoard({
        name: uniqueName,
        workspaceId: workspaceId
      });
      return response.data;
    } catch (err) {
      setError('Failed to create board');
      console.error('Error creating board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateUniqueBoardName]);

  const updateBoard = useCallback(async (boardId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardService.updateBoard(boardId, updates);
      return response.data;
    } catch (err) {
      setError('Failed to update board');
      console.error('Error updating board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBoard = useCallback(async (boardId) => {
    try {
      setLoading(true);
      setError(null);
      await boardService.deleteBoard(boardId);
      return true;
    } catch (err) {
      setError('Failed to delete board');
      console.error('Error deleting board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadBoardsForWorkspace,
    loadGroupsForBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    generateUniqueBoardName
  };
};