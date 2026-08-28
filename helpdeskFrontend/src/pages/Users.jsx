import { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, deleteUser } from '../services/api';
import './Users.css';

const ROLES = ['USER', 'SUPPORT', 'ADMIN'];

const AVATAR_COLORS = [
  '#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444',
];

const ROLE_BADGE = {
  ADMIN:      { label: 'Admin',      color: '#ec4899' },
  SUPPORT:    { label: 'Technicien', color: '#3b82f6' },
  USER:       { label: 'Employé',    color: '#14b8a6' },
};

const EMPTY_FORM = { nom: '', email: '', password: '', role: 'USER' };

const Users = () => {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Modal state ── */
  const [showModal,      setShowModal]      = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [formError,      setFormError]      = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [showPassword,   setShowPassword]   = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);

  /* ── Data fetching ── */
  const fetchUsers = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Delete ── */
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

  /* ── Create ── */
  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.nom.trim())      return setFormError('Le nom est requis.');
    if (!form.email.trim())    return setFormError("L'adresse email est requise.");
    if (!form.password.trim()) return setFormError('Le mot de passe est requis.');

    setSubmitting(true);
    try {
      const { data: newUser } = await createUser({ ...form, canManageUsers });
      setUsers((prev) => [newUser, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de la création.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal  = () => { setForm(EMPTY_FORM); setFormError(null); setCanManageUsers(false); setShowModal(true); };
  const closeModal = () => { if (!submitting) { setCanManageUsers(false); setShowModal(false); } };

  /* ── Helpers ── */
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role) => ROLE_BADGE[role] ?? { label: role ?? '—', color: '#5a6480' };

  return (
    <div className="users-page">

      {/* ── Header ── */}
      <div className="users-header">
        <div>
          <h1 className="users-title">Utilisateurs</h1>
          <p className="users-subtitle">Gestion des comptes employés de la plateforme</p>
        </div>
        <div className="users-header-actions">
          <button className="btn btn-ghost" onClick={fetchUsers} title="Actualiser">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Actualiser
          </button>
          <button id="btn-new-employee" className="btn btn-primary" onClick={openModal}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Nouvel Employé
          </button>
        </div>
      </div>

      {/* ── Users grid ── */}
      <div className="users-grid-container">
        {loading ? (
          <div className="state-container">
            <div className="spinner" />
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
            {users.map((user, i) => {
              const badge = getRoleBadge(user.role);
              return (
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
                    <span
                      className="user-card-role-badge"
                      style={{ background: `${badge.color}22`, color: badge.color, borderColor: `${badge.color}44` }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <button
                    id={`delete-user-${user.id}`}
                    className="btn-icon btn-danger-icon user-delete-btn"
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    title="Supprimer l'utilisateur"
                  >
                    {deletingId === user.id ? (
                      <div className="spinner-sm" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="table-footer">
        {!loading && !error && <span>{users.length} utilisateur(s) au total</span>}
      </div>

      {/* ── Modal : Nouvel Employé ── */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <div className="modal-header-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2 id="modal-title" className="modal-title">Nouvel Employé</h2>
                <p className="modal-subtitle">Créer un nouveau compte sur la plateforme</p>
              </div>
              <button className="modal-close" onClick={closeModal} disabled={submitting} aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form id="form-new-employee" onSubmit={handleSubmit} className="modal-form" noValidate>

              {formError && (
                <div className="form-error-banner" role="alert">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {formError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="field-nom" className="form-label">Nom complet</label>
                <input
                  id="field-nom"
                  name="nom"
                  type="text"
                  className="form-input"
                  placeholder="ex : Alice Martin"
                  value={form.nom}
                  onChange={handleFormChange}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="field-email" className="form-label">Adresse e-mail</label>
                <input
                  id="field-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="alice@entreprise.com"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="field-password" className="form-label">Mot de passe</label>
                <div className="input-password-wrapper">
                  <input
                    id="field-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleFormChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="field-role" className="form-label">Rôle</label>
                <div className="select-wrapper">
                  <select
                    id="field-role"
                    name="role"
                    className="form-input form-select"
                    value={form.role}
                    onChange={handleFormChange}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_BADGE[r]?.label ?? r}</option>
                    ))}
                  </select>
                  <svg className="select-chevron" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* ── Super Admin option (ADMIN only) ── */}
              {form.role === 'ADMIN' && (
                <div className="form-group form-group--checkbox">
                  <label className="checkbox-label" htmlFor="field-can-manage-users">
                    <div className="toggle-track">
                      <input
                        id="field-can-manage-users"
                        type="checkbox"
                        className="toggle-input"
                        checked={canManageUsers}
                        onChange={(e) => setCanManageUsers(e.target.checked)}
                      />
                      <span className="toggle-thumb" />
                    </div>
                    <div className="checkbox-label-text">
                      <span className="checkbox-label-title">Super Admin</span>
                      <span className="checkbox-label-hint">Accorder le droit de créer/supprimer des utilisateurs</span>
                    </div>
                  </label>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={submitting}>
                  Annuler
                </button>
                <button id="btn-submit-employee" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><div className="spinner-sm" /> Création...</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Créer l'employé
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
