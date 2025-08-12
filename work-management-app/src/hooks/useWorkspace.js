import { useState, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';

export const useWorkspace = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateUniqueWorkspaceName = useCallback((proposedName, existingWorkspaces) => {
    let baseName = proposedName.trim();
    if (!baseName) baseName = "New Workspace";
    
    let counter = 0;
    let finalName = baseName;
    
    while (existingWorkspaces.some(w => w.name === finalName)) {
      counter++;
      finalName = `${baseName} (${counter})`;
    }
    
    return finalName;
  }, []);

  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.getAllWorkspaces();
      
      // Transform data to match existing structure
      const transformedData = {
        workspaces: response.data.map(workspace => ({
          ...workspace,
          boards: [] // Will load boards later
        }))
      };
      
      return transformedData;
    } catch (err) {
      setError('Failed to load workspaces');
      console.error('Error loading workspaces:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkspace = useCallback(async (name, existingWorkspaces) => {
    try {
      setLoading(true);
      setError(null);
      const uniqueName = generateUniqueWorkspaceName(name, existingWorkspaces);
      const response = await workspaceService.createWorkspace({ name: uniqueName });
      return response.data;
    } catch (err) {
      setError('Failed to create workspace');
      console.error('Error creating workspace:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateUniqueWorkspaceName]);

  const updateWorkspace = useCallback(async (workspaceId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceService.updateWorkspace(workspaceId, updates);
      return response.data;
    } catch (err) {
      setError('Failed to update workspace');
      console.error('Error updating workspace:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWorkspace = useCallback(async (workspaceId) => {
    try {
      setLoading(true);
      setError(null);
      await workspaceService.deleteWorkspace(workspaceId);
      return true;
    } catch (err) {
      setError('Failed to delete workspace');
      console.error('Error deleting workspace:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    generateUniqueWorkspaceName
  };
};