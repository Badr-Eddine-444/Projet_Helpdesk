import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Intercepteur JWT ──────────────────────────────────────
// Avant chaque requête, injecte le token s'il est présent en localStorage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auth ──────────────────────────────────────────────────
export const login = (credentials) => api.post('/auth/login', credentials);

// ── Tickets ──────────────────────────────────────────────
export const getTickets    = ()       => api.get('/tickets');
export const createTicket  = (data)   => {
  // Le contrôleur Spring Boot attend createurId en @RequestParam (query string)
  const createurId = localStorage.getItem('id');
  return api.post(`/tickets?createurId=${createurId}`, data);
};
export const deleteTicket  = (id)     => api.delete(`/tickets/${id}`);

// ── Users ────────────────────────────────────────────────
export const getUsers      = ()       => api.get('/users');
export const createUser    = (data)   => api.post('/users', data);
export const deleteUser    = (id)     => api.delete(`/users/${id}`);

// ── Commentaires ─────────────────────────────────────────
export const getCommentaires    = ()     => api.get('/commentaires');
export const createCommentaire  = (data) => api.post('/commentaires', data);
export const deleteCommentaire  = (id)   => api.delete(`/commentaires/${id}`);

export default api;
