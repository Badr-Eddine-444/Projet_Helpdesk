import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileModal.css';

// ── Traduit le rôle technique en libellé lisible ─────────────────────────────
const getRoleLabel = (role) => {
  if (role === 'ADMIN')   return 'Administrateur';
  if (role === 'SUPPORT') return 'Technicien';
  if (role === 'USER')    return 'Employé';
  return role ?? 'Utilisateur';
};

const getRoleBadgeClass = (role) => {
  if (role === 'ADMIN')   return 'role-admin';
  if (role === 'SUPPORT') return 'role-support';
  return 'role-user';
};

const ProfileModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // ── Lecture du profil depuis localStorage ─────────────────────────────────
  const nom   = localStorage.getItem('nom')   ?? '';
  const email = localStorage.getItem('email') ?? '';
  const role  = localStorage.getItem('role')  ?? '';

  // ── Formulaire de modification ───────────────────────────────────────────
  const [editNom,      setEditNom]      = useState(nom);
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState(null); // { text, type }

  // ── Thème ────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return !document.body.classList.contains('light-theme');
  });

  // Synchronise le thème avec le DOM au montage et à chaque changement
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // ── Reset du formulaire quand le modal s'ouvre ───────────────────────────
  useEffect(() => {
    if (isOpen) {
      setEditNom(localStorage.getItem('nom') ?? '');
      setEditPassword('');
      setSaveMsg(null);
    }
  }, [isOpen]);

  // ── Fermeture par clic sur le backdrop ───────────────────────────────────
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // ── Fermeture par Escape ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // ── Enregistrement (stub console.log pour l'instant) ─────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!editNom.trim()) {
      setSaveMsg({ text: 'Le nom ne peut pas être vide.', type: 'error' });
      return;
    }

    setSaving(true);
    setSaveMsg(null);

    try {
      // TODO : remplacer par un PUT vers le backend
      const payload = { nom: editNom.trim() };
      if (editPassword.trim()) payload.password = editPassword.trim();
      console.log('Données à envoyer au backend :', payload);

      // Mise à jour optimiste du localStorage
      localStorage.setItem('nom', editNom.trim());

      setSaveMsg({ text: 'Profil mis à jour avec succès !', type: 'success' });
      setEditPassword('');

      // Petit délai pour laisser le message visible
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg({ text: 'Erreur lors de la mise à jour.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Déconnexion ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <div className="profile-modal" ref={modalRef}>

        {/* ── Bouton fermer ──────────────────────────────────────────────── */}
        <button className="profile-modal-close" onClick={onClose} aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── En-tête profil ─────────────────────────────────────────────── */}
        <div className="profile-header">
          <div className="profile-avatar-lg">
            {nom ? nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
          </div>
          <div className="profile-identity">
            <h2 id="profile-modal-title" className="profile-name">{nom || 'Utilisateur'}</h2>
            <p className="profile-email">{email || 'email@inconnu.com'}</p>
            <span className={`profile-role-badge ${getRoleBadgeClass(role)}`}>
              {getRoleLabel(role)}
            </span>
          </div>
        </div>

        <div className="profile-divider" />

        {/* ── Formulaire de modification ──────────────────────────────────── */}
        <form className="profile-form" onSubmit={handleSave}>
          <h3 className="profile-section-title">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Modifier mon profil
          </h3>

          {saveMsg && (
            <div className={`profile-msg profile-msg-${saveMsg.type}`} role="alert">
              {saveMsg.text}
            </div>
          )}

          <div className="profile-field">
            <label htmlFor="profile-nom" className="profile-label">Nom complet</label>
            <input
              id="profile-nom"
              type="text"
              className="profile-input"
              value={editNom}
              onChange={(e) => setEditNom(e.target.value)}
              placeholder="Votre nom"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email-display" className="profile-label">Email</label>
            <input
              id="profile-email-display"
              type="email"
              className="profile-input profile-input-disabled"
              value={email}
              disabled
              title="L'adresse email ne peut pas être modifiée"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-password" className="profile-label">
              Nouveau mot de passe
              <span className="profile-label-hint">(laisser vide pour ne pas changer)</span>
            </label>
            <div className="profile-password-wrapper">
              <input
                id="profile-password"
                type={showPassword ? 'text' : 'password'}
                className="profile-input"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="profile-password-toggle"
                onClick={() => setShowPassword(v => !v)}
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

          <button type="submit" className="btn btn-primary profile-save-btn" disabled={saving}>
            {saving ? (
              <><div className="spinner-sm" /> Enregistrement...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Enregistrer
              </>
            )}
          </button>
        </form>

        <div className="profile-divider" />

        {/* ── Préférences ─────────────────────────────────────────────────── */}
        <div className="profile-section">
          <h3 className="profile-section-title">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Préférences
          </h3>

          <div className="profile-pref-row">
            <div className="profile-pref-info">
              <span className="profile-pref-label">
                {isDark ? '🌙' : '☀️'} {isDark ? 'Mode Sombre' : 'Mode Clair'}
              </span>
              <span className="profile-pref-hint">Basculer l'apparence de l'interface</span>
            </div>
            <label className="theme-toggle" htmlFor="theme-toggle-input">
              <input
                id="theme-toggle-input"
                type="checkbox"
                className="theme-toggle-input"
                checked={isDark}
                onChange={() => setIsDark(v => !v)}
              />
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb" />
              </span>
            </label>
          </div>
        </div>

        <div className="profile-divider" />

        {/* ── Déconnexion ─────────────────────────────────────────────────── */}
        <button className="profile-logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Se déconnecter
        </button>

      </div>
    </div>
  );
};

export default ProfileModal;
