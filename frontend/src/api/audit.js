import { api } from './client.js';
export const auditApi = {
  getAll: (params = '') => api.get(`/api/audit?${params}`),
};
