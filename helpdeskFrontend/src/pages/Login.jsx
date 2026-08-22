import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [form,         setForm]         = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null); // efface l'erreur dès que l'utilisateur retape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await login({ email: form.email, password: form.password });

      // Persistance de la session dans le localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('id',    data.id);
      localStorage.setItem('nom',   data.nom);
      localStorage.setItem('role',  data.role);

      // Redirection vers le Dashboard
      navigate('/', { replace: true });

    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError('Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── Decorative background ── */}
      <div className="login-bg-blob login-blob-1" aria-hidden="true" />
      <div className="login-bg-blob login-blob-2" aria-hidden="true" />

      <div className="login-wrapper">
        {/* ── Brand ── */}
        <div className="login-brand" aria-label="HelpDesk">
          <div className="login-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.782-1.388A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                fill="currentColor"
                opacity=".2"
              />
              <path
                d="M12 8v4m0 4h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="login-brand-name">HelpDesk</span>
        </div>

        {/* ── Card ── */}
        <div className="login-card">
          <header className="login-card-header">
            <h1 className="login-card-title">Bienvenue</h1>
            <p className="login-card-subtitle">
              Connectez-vous à votre espace de travail
            </p>
          </header>

          <form
            id="form-login"
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* ── Bandeau d'erreur ── */}
            {error && (
              <div className="login-error-banner" role="alert">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                Adresse e-mail
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M22 6l-10 7L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="login-input"
                  placeholder="vous@entreprise.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  Mot de passe
                </label>
                <a href="#" className="login-forgot">Mot de passe oublié ?</a>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3" y="11" width="18" height="11" rx="2"
                      stroke="currentColor" strokeWidth="2"
                    />
                    <path
                      d="M7 11V7a5 5 0 0110 0v4"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      />
                      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
                        stroke="currentColor" strokeWidth="2"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Footer ── */}
        <p className="login-footer-note">
          Accès réservé aux employés de l'entreprise.
          <br />
          Contactez votre administrateur pour obtenir un compte.
        </p>
      </div>
    </div>
  );
};

export default Login;
