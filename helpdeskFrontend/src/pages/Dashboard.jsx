import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, getUsers, deleteTicket } from '../services/api';
import api from '../services/api';
import './Dashboard.css';

// ── Mapping Enum Java Priorite → libellé + classe CSS ────────────────────────
const PRIORITY_CONFIG = {
  HIGH:   { label: 'Haute',   class: 'priority-high' },
  MEDIUM: { label: 'Moyenne', class: 'priority-medium' },
  LOW:    { label: 'Basse',   class: 'priority-low' },
};

// ── Mapping Enum Java StatutTicket → libellé + classe CSS ────────────────────
const STATUS_CONFIG = {
  NEW:         { label: 'Nouveau',   class: 'status-open' },
  ASSIGNED:    { label: 'Assigné',   class: 'status-open' },
  IN_PROGRESS: { label: 'En cours',  class: 'status-progress' },
  RESOLVED:    { label: 'Résolu',    class: 'status-resolved' },
  CLOSED:      { label: 'Fermé',     class: 'status-closed' },
};

// ── Options du sélecteur de statut ───────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'NEW',         label: 'Nouveau' },
  { value: 'ASSIGNED',    label: 'Assigné' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED',    label: 'Résolu' },
  { value: 'CLOSED',      label: 'Fermé' },
];

// ── Notification légère (toast) ───────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type}`} role="alert">
    <span>{message}</span>
    <button className="toast-close" onClick={onClose} aria-label="Fermer">✕</button>
  </div>
);

const Dashboard = () => {
  // ── RBAC : lecture du rôle et de l'ID depuis le localStorage ──────────────
  const role          = localStorage.getItem('role') ?? '';
  const currentUserId = Number(localStorage.getItem('id'));
  const isUser        = role === 'USER';
  const isSupport     = role === 'SUPPORT';
  const isAdmin       = role === 'ADMIN';
  const isTechOrAdmin = isSupport || isAdmin;

  // ── States principaux ─────────────────────────────────────────────────────
  const [tickets,     setTickets]     = useState([]);
  const [techniciens, setTechniciens] = useState([]);   // ← NOUVEAU
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [toast,       setToast]       = useState(null); // { message, type }

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterStatus,    setFilterStatus]    = useState('ALL');
  const [filterPriority,  setFilterPriority]  = useState('ALL');

  // ── Helper : affiche un toast ─────────────────────────────────────────────
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Chargement des tickets ────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getTickets();

      // RBAC : un SUPPORT ne voit que les tickets qui lui sont assignés
      if (role === 'SUPPORT') {
        setTickets(data.filter((t) => Number(t.technicien?.id) === currentUserId));
      } else {
        setTickets(data);
      }
    } catch (err) {
      setError('Impossible de charger les tickets. Vérifiez que le backend est démarré sur le port 8080.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role, currentUserId]);

  // ── Chargement des techniciens (ADMIN + TECHNICIEN) ───────────────────────
  const fetchTechniciens = useCallback(async () => {
    try {
      const { data } = await getUsers();
      // Filtre : on conserve TECHNICIEN et ADMIN pour l'assignation
      setTechniciens(
        data.filter((u) => u.role === 'SUPPORT' || u.role === 'ADMIN')
      );
    } catch (err) {
      console.error('Impossible de charger la liste des techniciens :', err);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    if (isTechOrAdmin) fetchTechniciens(); // charger seulement si nécessaire
  }, [fetchTickets, fetchTechniciens, isTechOrAdmin]);

  // ── Changement de statut ──────────────────────────────────────────────────
  const handleStatutChange = async (ticketId, newStatut) => {
    try {
      await api.put(`/tickets/${ticketId}/statut?statut=${newStatut}`);
      // Mise à jour optimiste du state local (évite un rechargement complet)
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, statut: newStatut } : t))
      );
      showToast('Statut mis à jour avec succès.', 'success');
    } catch (err) {
      showToast('Erreur lors de la mise à jour du statut.');
      console.error(err);
    }
  };

  // ── Assignation d'un technicien ───────────────────────────────────────────
  const handleAssignChange = async (ticketId, technicienId) => {
    try {
      await api.put(`/tickets/${ticketId}/assigner?technicienId=${technicienId}`);
      // Mise à jour optimiste : retrouver l'objet technicien pour mettre à jour l'affichage
      const tech = techniciens.find((t) => String(t.id) === String(technicienId));
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, technicien: tech ?? null } : t
        )
      );
      showToast('Technicien assigné avec succès.', 'success');
    } catch (err) {
      showToast("Erreur lors de l'assignation du technicien.");
      console.error(err);
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce ticket définitivement ?')) return;
    setDeletingId(id);
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      showToast('Erreur lors de la suppression du ticket.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus   = filterStatus   === 'ALL' || t.statut   === filterStatus;
    const matchPriority = filterPriority === 'ALL' || t.priorite === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:    tickets.length,
    ouverts:  tickets.filter((t) => t.statut === 'NEW' || t.statut === 'ASSIGNED').length,
    enCours:  tickets.filter((t) => t.statut === 'IN_PROGRESS').length,
    resolus:  tickets.filter((t) => t.statut === 'RESOLVED').length,
  };

  // ── Helper : nom du créateur ──────────────────────────────────────────────
  const getCreatorName = (ticket) =>
    ticket.utilisateur?.nom
    ?? ticket.createur?.nom
    ?? ticket.utilisateurNom
    ?? (ticket.createurId ? `User #${ticket.createurId}` : '—');

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">

      {/* ── Toast notification ─────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">
            {isUser ? 'Mes Tickets' : isSupport ? 'Mes Interventions' : 'Tableau de Bord'}
          </h1>
          <p className="dashboard-subtitle">
            {isUser
              ? 'Retrouvez ici tous vos tickets de support'
              : isSupport
                ? 'Tickets qui vous sont assignés'
                : 'Gestion des tickets de support informatique'}
          </p>
        </div>
        {!isSupport && (
          <Link to="/create-ticket" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nouveau Ticket
          </Link>
        )}
      </div>

      {/* ── Stats Cards (masquées pour USER) ────────────────────────────────── */}
      {!isUser && (
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Tickets</span>
            </div>
          </div>
          <div className="stat-card stat-open">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.ouverts}</span>
              <span className="stat-label">Ouverts / Assignés</span>
            </div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.enCours}</span>
              <span className="stat-label">En Cours</span>
            </div>
          </div>
          <div className="stat-card stat-resolved">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.resolus}</span>
              <span className="stat-label">Résolus</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Filtres & Recherche ──────────────────────────────────────────────── */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            id="search-tickets"
            type="text"
            className="search-input"
            placeholder="Rechercher un ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            id="filter-status"
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            id="filter-priority"
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Basse</option>
          </select>
          <button className="btn btn-ghost" onClick={fetchTickets} title="Rafraîchir">
            <svg viewBox="0 0 24 24" fill="none" style={{width:'16px',height:'16px'}}>
              <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="table-container">
        {loading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <p>Chargement des tickets...</p>
          </div>
        ) : error ? (
          <div className="state-container state-error">
            <svg viewBox="0 0 24 24" fill="none" style={{width:'48px',height:'48px',color:'var(--danger)'}}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchTickets}>Réessayer</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="state-container">
            <svg viewBox="0 0 24 24" fill="none" style={{width:'48px',height:'48px',color:'var(--text-muted)'}}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Aucun ticket trouvé.</p>
            <Link to="/create-ticket" className="btn btn-primary">Créer le premier ticket</Link>
          </div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Titre</th>
                <th>Description</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Créateur</th>
                {/* Colonne Technicien visible seulement pour ADMIN */}
                {isAdmin && <th>Technicien</th>}
                {/* Colonne Actions visible seulement pour ADMIN */}
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => {
                const pConf = PRIORITY_CONFIG[ticket.priorite] || { label: ticket.priorite, class: '' };
                const sConf = STATUS_CONFIG[ticket.statut]   || { label: ticket.statut,   class: '' };

                return (
                  <tr key={ticket.id}>
                    {/* ID */}
                    <td className="ticket-id">#{ticket.id}</td>

                    {/* Titre */}
                    <td className="ticket-title">{ticket.titre}</td>

                    {/* Description */}
                    <td className="ticket-desc">{ticket.description || '—'}</td>

                    {/* Priorité */}
                    <td>
                      <span className={`badge ${pConf.class}`}>{pConf.label}</span>
                    </td>

                    {/* Statut : select interactif si ADMIN, ou SUPPORT assigné au ticket */}
                    <td>
                      {(isAdmin || (isSupport && Number(ticket.technicien?.id) === currentUserId)) ? (
                        <select
                          id={`statut-select-${ticket.id}`}
                          className={`inline-select status-select ${sConf.class}`}
                          value={ticket.statut ?? ''}
                          onChange={(e) => handleStatutChange(ticket.id, e.target.value)}
                          aria-label={`Modifier le statut du ticket ${ticket.id}`}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`badge ${sConf.class}`}>{sConf.label}</span>
                      )}
                    </td>

                    {/* Créateur : nom réel depuis l'API */}
                    <td className="ticket-creator">
                      {getCreatorName(ticket)}
                    </td>

                    {/* Assignation technicien : visible seulement pour ADMIN */}
                    {isAdmin && (
                      <td>
                        <select
                          id={`tech-select-${ticket.id}`}
                          className="inline-select tech-select"
                          value={ticket.technicien?.id ?? ''}
                          onChange={(e) => handleAssignChange(ticket.id, e.target.value)}
                          aria-label={`Assigner un technicien au ticket ${ticket.id}`}
                        >
                          <option value="">— Non assigné —</option>
                          {techniciens.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.nom ?? tech.username ?? `User #${tech.id}`}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* Actions : suppression réservée à ADMIN */}
                    {isAdmin && (
                      <td>
                        <button
                          id={`delete-ticket-${ticket.id}`}
                          className="btn-icon btn-danger-icon"
                          onClick={() => handleDelete(ticket.id)}
                          disabled={deletingId === ticket.id}
                          title="Supprimer le ticket"
                        >
                          {deletingId === ticket.id ? (
                            <div className="spinner-sm"></div>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="table-footer">
          <span>{filtered.length} ticket(s) affiché(s) sur {tickets.length} total</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
