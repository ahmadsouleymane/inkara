import { api } from './client.js';

export const libraryApi = {
  get: () => api.get('/api/library'),
  update: (data) => api.put('/api/library', data),
};
