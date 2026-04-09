import { api } from './client.js';

export const superadminApi = {
  getStats: () => api.get('/api/superadmin'),
  getOrganizations: (params = '') => api.get(`/api/superadmin/organizations?${params}`),
  updatePlan: (id, data) => api.put(`/api/superadmin/organizations/${id}/plan`, data),
  suspendOrg: (id) => api.put(`/api/superadmin/organizations/${id}/suspend`),
};
