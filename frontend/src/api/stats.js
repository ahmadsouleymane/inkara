import { api } from './client.js';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';
export const statsApi = {
  getDashboard: () => api.get('/api/stats'),
  getKPIs: () => api.get('/api/stats/kpis'),
  getTrends: (months = 12) => api.get(`/api/stats/trends?months=${months}`),
  getMembers: () => api.get('/api/stats/members'),
  getCollection: () => api.get('/api/stats/collection'),
  getCirculation: () => api.get('/api/stats/circulation'),
  getExportUrl: (type) => `${API_URL}/api/stats/export?type=${type}`,
  getPdfExportUrl: (type) => `${API_URL}/api/stats/export-pdf?type=${type}`,
};
