import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response?.status === 200 && response?.data) {
      try {
        const basicToken = `Basic ${btoa(`${email}:${password}`)}`;
        localStorage.setItem('token', basicToken);
      } catch (e) {
        // btoa may throw on unicode; in our case emails/passwords are ascii
      }
    }
    return response;
  },
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/current-user'),
};