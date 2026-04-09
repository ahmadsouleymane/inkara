import { api } from './client.js';
export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
  updateMe: (data) => api.put('/api/auth/me', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/api/auth/reset-password/${token}`, data),
  getFavorites: () => api.get('/api/auth/favorites'),
  addFavorite: (bookId) => api.post(`/api/auth/favorites/${bookId}`),
  removeFavorite: (bookId) => api.delete(`/api/auth/favorites/${bookId}`),
  getUserStats: (userId) => api.get(`/api/auth/stats/${userId}`),
};
