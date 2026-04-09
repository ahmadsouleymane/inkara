import { api } from './client.js';
export const loansApi = {
  getAll: (params = '') => api.get(`/api/loans?${params}`),
  getUserLoans: (userId) => api.get(`/api/loans/user/${userId}`),
  borrow: (data) => api.post('/api/loans/borrow', data),
  return: (id) => api.put(`/api/loans/${id}/return`),
  renew: (id) => api.put(`/api/loans/${id}/renew`),
  returnByScan: (data) => api.post('/api/loans/return-by-scan', data),
  getDashboardStats: () => api.get('/api/loans/dashboard-stats'),
};
