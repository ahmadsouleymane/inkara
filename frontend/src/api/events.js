import { api } from './client.js';
export const eventsApi = {
  getAll: () => api.get('/api/events'),
  create: (data) => api.post('/api/events', data),
  delete: (id) => api.delete(`/api/events/${id}`),
  register: (id) => api.post(`/api/events/${id}/register`),
  unregister: (id) => api.delete(`/api/events/${id}/register`),
  getRegistrations: (id) => api.get(`/api/events/${id}/registrations`),
};
