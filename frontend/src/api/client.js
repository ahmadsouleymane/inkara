// Client API de base — gère l'authentification et les erreurs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('smartlib_token');

  const config = {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}

// Méthodes HTTP simplifiées
export const api = {
  get: (url) => request(url),
  post: (url, data) =>
    request(url, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  put: (url, data) =>
    request(url, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (url, data) =>
    request(url, {
      method: 'DELETE',
      ...(data ? { body: JSON.stringify(data) } : {}),
    }),
};
