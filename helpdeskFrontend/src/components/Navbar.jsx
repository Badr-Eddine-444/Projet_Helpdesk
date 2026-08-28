import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import './Navbar.css';

// Génère 1 ou 2 lettres d'initiales à partir du nom complet
const getInitials = (nom) => {
  if (!nom) return '?';
  const parts = nom.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Traduit le rôle technique en libellé lisible
const getRoleLabel = (role) => {
  if (role === 'ADMIN')   return 'Administrateur';
  if (role === 'SUPPORT') return 'Technicien';
  if (role === 'USER')    return 'Employé';
  return role ?? 'Utilisateur';
};

const Navbar = () => {
  // ── 1. Lecture du localStorage ──────────────────────────────────────────
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    setNom(localStorage.getItem('nom') ?? '');
    setRole(localStorage.getItem('role') ?? '');
  }, []);

  // ── 2. Dropdown profil ──────────────────────────────────────────────────
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Ferme le menu si l'utilisateur clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── 3. ProfileModal ────────────────────────────────────────────────────
  const [showProfile, setShowProfile] = useState(false);

  const openProfile = () => {
    setIsMenuOpen(false);
    setShowProfile(true);
  };

  return (
    <>
      <nav className="navbar">
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div className="navbar-brand">
          <svg className="navbar-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="navbar-brand-name">HelpDesk</span>
          <span className="navbar-brand-tag">Pro</span>
        </div>

        {/* ── Navigation centrale ────────────────────────────────────────── */}
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Dashboard
            </NavLink>
          </li>
          {role !== 'SUPPORT' && (
            <li>
              <NavLink to="/create-ticket" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Nouveau Ticket
              </NavLink>
            </li>
          )}

          {/* ── RBAC : visible uniquement pour les ADMIN ────────────────── */}
          {role === 'ADMIN' && (
            <li>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Utilisateurs
              </NavLink>
            </li>
          )}
        </ul>

        {/* ── Zone profil avec dropdown ──────────────────────────────────── */}
        <div className="navbar-user-wrapper" ref={menuRef}>
          <div
            className={`navbar-user${isMenuOpen ? ' open' : ''}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            role="button"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <div className="user-avatar">{getInitials(nom)}</div>
            <div className="user-info">
              <span className="user-name">{nom || 'Utilisateur'}</span>
              <span className="user-role">{getRoleLabel(role)}</span>
            </div>
            {/* Chevron d'indication */}
            <svg
              className={`profile-chevron${isMenuOpen ? ' rotated' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* ── Dropdown : un seul bouton → ouvre le ProfileModal ───────── */}
          {isMenuOpen && (
            <div className="profile-dropdown" role="menu">
              <button
                className="dropdown-item"
                onClick={openProfile}
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Mon Profil / Paramètres
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── ProfileModal (rendu hors de la nav pour le z-index) ──────────── */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};

export default Navbar;
