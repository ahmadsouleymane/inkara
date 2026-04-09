import { api } from './client.js';
export const presenceApi = {
  checkIn: (data) => api.post('/api/presence/checkin', data),
  checkOut: (id) => api.put(`/api/presence/${id}/checkout`),
  getToday: () => api.get('/api/presence/today'),
  getHistory: (params = '') => api.get(`/api/presence/history?${params}`),
};
