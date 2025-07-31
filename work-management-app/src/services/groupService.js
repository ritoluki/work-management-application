import api from './api';

export const groupService = {
  getGroupsByBoardId: (boardId) => api.get(`/groups/board/${boardId}`),
  getGroupById: (id) => api.get(`/groups/${id}`),
  createGroup: (data) => api.post('/groups', data),
  updateGroup: (id, data) => api.put(`/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
};