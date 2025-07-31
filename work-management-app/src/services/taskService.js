import api from './api';

export const taskService = {
  getAllTasks: () => api.get('/tasks'),
  getTasksByGroupId: (groupId) => api.get(`/tasks/group/${groupId}`),
  getTasksByBoard: (boardId) => api.get(`/tasks/board/${boardId}`),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  assignTask: (taskId, userId) => api.put(`/tasks/${taskId}/assign/${userId}`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};