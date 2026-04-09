import { api } from './client.js';

export const readingListApi = {
  getAll: () => api.get('/api/reading-lists'),
  getOne: (id) => api.get(`/api/reading-lists/${id}`),
  create: (data) => api.post('/api/reading-lists', data),
  update: (id, data) => api.put(`/api/reading-lists/${id}`, data),
  remove: (id) => api.delete(`/api/reading-lists/${id}`),
  addBook: (id, bookId) => api.post(`/api/reading-lists/${id}/books/${bookId}`),
  removeBook: (id, bookId) => api.delete(`/api/reading-lists/${id}/books/${bookId}`),
};
