import { useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { workspaceService } from '../services/workspaceService';
import { boardService } from '../services/boardService';
import { taskService } from '../services/taskService';

export const useAdminOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User management
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      return response.data || [];
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.createUser(userData);
      return response.data;
    } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.updateUser(userId, updates);
      return response.data;
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await userService.deleteUser(userId);
      return true;
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Workspace management
  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.getAllWorkspaces();
      return response.data || [];
    } catch (err) {
      setError('Failed to load workspaces');
      console.error('Error loading workspaces:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Board management
  const loadBoards = useCallback(async (workspaceId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardService.getBoardsByWorkspace(workspaceId);
      return response.data || [];
    } catch (err) {
      setError('Failed to load boards');
      console.error('Error loading boards:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Task management
  const loadTasks = useCallback(async (boardId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTasksByBoard(boardId);
      return response.data || [];
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignTask = useCallback(async (taskId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.assignTask(taskId, userId);
      return response.data;
    } catch (err) {
      setError('Failed to assign task');
      console.error('Error assigning task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // User operations
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    // Workspace operations
    loadWorkspaces,
    // Board operations
    loadBoards,
    // Task operations
    loadTasks,
    assignTask
  };
};