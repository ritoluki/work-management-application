import api from './api';

export const taskService = {
  getAllTasks: () => api.get('/tasks'),
  getTasksByGroupId: (groupId) => api.get(`/tasks/group/${groupId}`),
  getTasksByBoard: (boardId) => api.get(`/tasks/board/${boardId}`),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (data, currentUserId) => api.post(`/tasks?currentUserId=${currentUserId}`, data),
  updateTask: (id, data, currentUserId) => api.put(`/tasks/${id}?currentUserId=${currentUserId}`, data),
  assignTask: (taskId, userId, currentUserId) => api.put(`/tasks/${taskId}/assign/${userId}?currentUserId=${currentUserId}`),
  deleteTask: (id, currentUserId) => api.delete(`/tasks/${id}?currentUserId=${currentUserId}`),
};