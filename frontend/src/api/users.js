import { api } from './client.js';
export const usersApi = {
  getAll: (params = '') => api.get(`/api/users?${params}`),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/api/users/${id}`),
};
