import { api } from './client.js';
export const reviewsApi = {
  getBookReviews: (bookId) => api.get(`/api/reviews/book/${bookId}`),
  upsert: (data) => api.post('/api/reviews', data),
  delete: (id) => api.delete(`/api/reviews/${id}`),
};
