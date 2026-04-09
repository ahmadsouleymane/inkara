import { api } from './client.js';

export const booksApi = {
  getAll: (params = '') => api.get(`/api/books?${params}`),
  getById: (id) => api.get(`/api/books/${id}`),
  getStats: () => api.get('/api/books/stats'),
  create: (data) => api.post('/api/books', data),
  update: (id, data) => api.put(`/api/books/${id}`, data),
  delete: (id) => api.delete(`/api/books/${id}`),
};
