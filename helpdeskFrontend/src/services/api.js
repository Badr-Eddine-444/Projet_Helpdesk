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
export const getTicketById = (id)     => api.get(`/tickets/${id}`);
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

// ── Commentaires (routes nestées sous /tickets) ──────────
export const getCommentairesByTicket = (ticketId) =>
  api.get(`/tickets/${ticketId}/commentaires`);

export const ajouterCommentaire = (ticketId, auteurId, texte) =>
  api.post(`/tickets/${ticketId}/commentaires?auteurId=${auteurId}`, { texte });

export const deleteCommentaire = (id) => api.delete(`/commentaires/${id}`);

// ── Pièces jointes (Attachments) ─────────────────────────
export const getAttachmentsByTicket = (ticketId) =>
  api.get(`/tickets/${ticketId}/attachments`);

export const uploaderFichier = (ticketId, uploaderId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tickets/${ticketId}/attachments?uploaderId=${uploaderId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const telechargerFichier = (nomFichier) =>
  api.get(`/tickets/attachments/download/${nomFichier}`, { responseType: 'blob' });

export const deleteAttachment = (id) => api.delete(`/tickets/attachments/${id}`);

// ── Historique d'audit ───────────────────────────────────
export const getHistoriqueByTicket = (ticketId) =>
  api.get(`/tickets/${ticketId}/historique`);

// ── Ancien export (compatibilité) ────────────────────────
export const getCommentaires    = ()     => api.get('/commentaires');
export const createCommentaire  = (data) => api.post('/commentaires', data);

export default api;
