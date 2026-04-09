import { api } from './client.js';
export const reservationsApi = {
  getAll: (params = '') => api.get(`/api/reservations?${params}`),
  getMine: () => api.get('/api/reservations/me'),
  getBookQueue: (bookId) => api.get(`/api/reservations/book/${bookId}`),
  create: (data) => api.post('/api/reservations', data),
  cancel: (id) => api.delete(`/api/reservations/${id}`),
};
