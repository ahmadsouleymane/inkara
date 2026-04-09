import { api } from './client.js';

export const lookupApi = {
  byISBN: (isbn) => api.get(`/api/lookup/isbn/${isbn}`),
};
