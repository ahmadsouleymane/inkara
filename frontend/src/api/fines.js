import { api } from './client.js';
export const finesApi = {
  getAll: (params = '') => api.get(`/api/fines?${params}`),
  getUserFines: (userId) => api.get(`/api/fines/user/${userId}`),
  pay: (id) => api.put(`/api/fines/${id}/pay`),
  create: (data) => api.post('/api/fines', data),
  delete: (id) => api.delete(`/api/fines/${id}`),
};
