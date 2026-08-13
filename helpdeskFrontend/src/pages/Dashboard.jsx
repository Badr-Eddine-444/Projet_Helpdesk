import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, deleteTicket } from '../services/api';
import './Dashboard.css';

const PRIORITY_CONFIG = {
  HAUTE: { label: 'Haute', class: 'priority-high' },
  MOYENNE: { label: 'Moyenne', class: 'priority-medium' },
  BASSE: { label: 'Basse', class: 'priority-low' },
};

const STATUS_CONFIG = {
  OUVERT: { label: 'Ouvert', class: 'status-open' },
  EN_COURS: { label: 'En cours', class: 'status-progress' },
  RESOLU: { label: 'Résolu', class: 'status-resolved' },
  FERME: { label: 'Fermé', class: 'status-closed' },
};

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getTickets();
      setTickets(data);
    } catch (err) {
      setError('Impossible de charger les tickets. Vérifiez que le backend est démarré sur le port 8080.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce ticket définitivement ?')) return;
    setDeletingId(id);
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression du ticket.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.statut === filterStatus;
    const matchPriority = filterPriority === 'ALL' || t.priorite === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  // Stats
  const stats = {
    total: tickets.length,
    ouverts: tickets.filter((t) => t.statut === 'OUVERT').length,
    enCours: tickets.filter((t) => t.statut === 'EN_COURS').length,
    resolus: tickets.filter((t) => t.statut === 'RESOLU').length,
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Tableau de Bord</h1>
          <p className="dashboard-subtitle">Gestion des tickets de support informatique</p>
        </div>
        <Link to="/create-ticket" className="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nouveau Ticket
        </Link>
      </div>

      {/* Stats Cards */}
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
            <span className="stat-label">Ouverts</span>
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

      {/* Filters & Search */}
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
            <option value="OUVERT">Ouvert</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLU">Résolu</option>
            <option value="FERME">Fermé</option>
          </select>
          <select
            id="filter-priority"
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="HAUTE">Haute</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="BASSE">Basse</option>
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

      {/* Table */}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => {
                const pConf = PRIORITY_CONFIG[ticket.priorite] || { label: ticket.priorite, class: '' };
                const sConf = STATUS_CONFIG[ticket.statut] || { label: ticket.statut, class: '' };
                return (
                  <tr key={ticket.id}>
                    <td className="ticket-id">#{ticket.id}</td>
                    <td className="ticket-title">{ticket.titre}</td>
                    <td className="ticket-desc">{ticket.description || '—'}</td>
                    <td>
                      <span className={`badge ${pConf.class}`}>{pConf.label}</span>
                    </td>
                    <td>
                      <span className={`badge ${sConf.class}`}>{sConf.label}</span>
                    </td>
                    <td className="ticket-creator">User #{ticket.createurId}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <div className="table-footer">
          <span>{filtered.length} ticket(s) affiché(s) sur {tickets.length} total</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
