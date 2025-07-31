import api from './api';

export const workspaceService = {
  getAllWorkspaces: () => api.get('/workspaces'),
  getWorkspaceById: (id) => api.get(`/workspaces/${id}`),
  createWorkspace: (data) => api.post('/workspaces', data),
  updateWorkspace: (id, data) => api.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id) => api.delete(`/workspaces/${id}`),
};