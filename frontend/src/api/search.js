import { api } from './client.js';

export const searchApi = {
  suggest: (q) => api.get(`/api/search/suggest?q=${encodeURIComponent(q)}`),
  search: (params) => api.get(`/api/search?${params}`),
};
