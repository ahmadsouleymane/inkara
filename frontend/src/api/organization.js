import { api } from './client.js';

export const organizationApi = {
  getMine: () => api.get('/api/organization'),
  update: (data) => api.put('/api/organization', data),
  publish: () => api.put('/api/organization/publish'),
  unpublish: () => api.put('/api/organization/unpublish'),
  invite: (data) => api.post('/api/organization/invite', data),
  getMembers: (params = '') => api.get(`/api/organization/members?${params}`),
  updateMemberRole: (userId, role) => api.put(`/api/organization/members/${userId}/role`, { role }),
  removeMember: (userId) => api.delete(`/api/organization/members/${userId}`),
  getPublicSite: (slug) => api.get(`/api/organization/public/${slug}`),
  getPublicBooks: (slug, params = '') => api.get(`/api/organization/public/${slug}/books?${params}`),
  getPublicEvents: (slug) => api.get(`/api/organization/public/${slug}/events`),
};
