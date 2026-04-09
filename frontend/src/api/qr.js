import { api } from './client.js';

export const qrApi = {
  generateForBook: (bookId) => api.post(`/api/qr/book/${bookId}`),
  generateBatch: (bookIds) => api.post('/api/qr/books/batch', { bookIds }),
  generateAll: () => api.post('/api/qr/books/generate-all'),
  scanBook: (bookId) => api.get(`/api/qr/scan/book/${bookId}`),
  // PDF: utiliser directement l'URL pour le téléchargement
  getPdfUrl: (bookIds) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:7080';
    const params = bookIds ? `?bookIds=${bookIds.join(',')}` : '';
    return `${base}/api/qr/books/pdf${params}`;
  },
};

export const selfCheckoutApi = {
  identify: (userId) => api.post('/api/selfcheckout/identify', { userId }),
  borrow: (userId, bookId) => api.post('/api/selfcheckout/borrow', { userId, bookId }),
  return: (userId, bookId) => api.post('/api/selfcheckout/return', { userId, bookId }),
};
