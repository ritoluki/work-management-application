import api from './api';

export const boardService = {
  getBoardsByWorkspaceId: (workspaceId) => api.get(`/boards/workspace/${workspaceId}`),
  getBoardsByWorkspace: (workspaceId) => api.get(`/boards/workspace/${workspaceId}`),
  getBoardById: (id) => api.get(`/boards/${id}`),
  createBoard: (data) => api.post('/boards', data),
  updateBoard: (id, data) => api.put(`/boards/${id}`, data),
  deleteBoard: (id) => api.delete(`/boards/${id}`),
};