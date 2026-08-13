import { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Impossible de charger les utilisateurs. Vérifiez que le backend est démarré.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const AVATAR_COLORS = [
    '#6366f1','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#ef4444',
  ];

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1 className="users-title">Utilisateurs</h1>
          <p className="users-subtitle">Gestion des comptes utilisateurs de la plateforme</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchUsers}>
          <svg viewBox="0 0 24 24" fill="none" style={{width:'16px',height:'16px'}}>
            <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Actualiser
        </button>
      </div>

      <div className="users-grid-container">
        {loading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        ) : error ? (
          <div className="state-container">
            <p style={{ color: 'var(--danger)' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchUsers}>Réessayer</button>
          </div>
        ) : users.length === 0 ? (
          <div className="state-container">
            <p>Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user, i) => (
              <div key={user.id} className="user-card">
                <div
                  className="user-card-avatar"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {getInitials(user.nom || user.name || user.username || String(user.id))}
                </div>
                <div className="user-card-info">
                  <span className="user-card-name">
                    {user.nom || user.name || user.username || `Utilisateur #${user.id}`}
                  </span>
                  <span className="user-card-email">{user.email || '—'}</span>
                  <span className="user-card-id">ID #{user.id}</span>
                </div>
                <button
                  id={`delete-user-${user.id}`}
                  className="btn-icon btn-danger-icon user-delete-btn"
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                  title="Supprimer l'utilisateur"
                >
                  {deletingId === user.id ? (
                    <div className="spinner-sm"></div>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="table-footer">
        {!loading && !error && <span>{users.length} utilisateur(s) au total</span>}
      </div>
    </div>
  );
};

export default Users;
