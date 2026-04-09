import { api } from './client.js';

export const sitebuilderApi = {
  // Pages
  getPages: () => api.get('/api/sitebuilder/pages'),
  getPage: (slug) => api.get(`/api/sitebuilder/pages/${slug}`),
  createPage: (data) => api.post('/api/sitebuilder/pages', data),
  updatePage: (slug, data) => api.put(`/api/sitebuilder/pages/${slug}`, data),
  deletePage: (slug) => api.delete(`/api/sitebuilder/pages/${slug}`),
  reorderPages: (pages) => api.put('/api/sitebuilder/pages/reorder', { pages }),

  // Theme
  getTheme: () => api.get('/api/sitebuilder/theme'),
  updateTheme: (data) => api.put('/api/sitebuilder/theme', data),

  // Public
  getPublicPages: (slug) => api.get(`/api/organization/public/${slug}/pages`),
  getPublicPage: (slug, pageSlug) => api.get(`/api/organization/public/${slug}/pages/${pageSlug}`),
  getPublicTheme: (slug) => api.get(`/api/organization/public/${slug}/theme`),
};
