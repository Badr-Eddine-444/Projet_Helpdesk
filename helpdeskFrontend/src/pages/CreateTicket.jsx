import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../services/api';
import './CreateTicket.css';

const INITIAL_FORM = {
  titre: '',
  description: '',
  priorite: 'MEDIUM',  // Enum Java : LOW | MEDIUM | HIGH
  statut: 'NEW',       // Enum Java : NEW | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED
};

const CreateTicket = () => {
  const navigate = useNavigate();

  // ── Identifiant de l'utilisateur connecté (issu du JWT stocké) ──────────
  const currentUserId = Number(localStorage.getItem('id'));
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Structure imbriquée attendue par l'entité JPA côté Spring Boot
      await createTicket({
        ...form,
        utilisateur: { id: currentUserId },
      });
      setSuccess(true);
      setForm(INITIAL_FORM);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Erreur inattendue lors de la création du ticket.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="form-card">
        {/* Card Header */}
        <div className="form-card-header">
          <div className="form-header-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12v4m0-4h.01M12 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="form-card-title">Nouveau Ticket</h1>
            <p className="form-card-subtitle">Renseignez les informations du ticket de support</p>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="alert alert-success" role="alert">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ticket créé avec succès ! Redirection en cours...
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="alert alert-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form id="create-ticket-form" onSubmit={handleSubmit} className="ticket-form" noValidate>
          <div className="form-group">
            <label htmlFor="titre" className="form-label">
              Titre <span className="required">*</span>
            </label>
            <input
              id="titre"
              type="text"
              name="titre"
              value={form.titre}
              onChange={handleChange}
              className="form-input"
              placeholder="Ex: Imprimante réseau hors service - Bureau 3B"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-input form-textarea"
              rows={5}
              placeholder="Décrivez le problème en détail : symptômes, étapes pour reproduire, impact..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priorite" className="form-label">Priorité</label>
              <div className="select-wrapper">
                <select
                  id="priorite"
                  name="priorite"
                  value={form.priorite}
                  onChange={handleChange}
                  className="form-input form-select"
                >
                  {/* Valeurs = Enum Java Priorite */}
                  <option value="HIGH">🔴 Haute</option>
                  <option value="MEDIUM">🟡 Moyenne</option>
                  <option value="LOW">🟢 Basse</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="statut" className="form-label">Statut</label>
              <div className="select-wrapper">
                <select
                  id="statut"
                  name="statut"
                  value={form.statut}
                  onChange={handleChange}
                  className="form-input form-select"
                >
                  {/* Valeurs = Enum Java StatutTicket */}
                  <option value="NEW">Nouveau</option>
                  <option value="ASSIGNED">Assigné</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="RESOLVED">Résolu</option>
                  <option value="CLOSED">Fermé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-info-box">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Le ticket sera créé et associé à votre compte (ID&nbsp;<strong>#{currentUserId}</strong>).</span>
          </div>

          <div className="form-actions">
            <Link to="/" className="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" style={{width:'16px',height:'16px'}}>
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Annuler
            </Link>
            <button
              id="submit-ticket"
              type="submit"
              className="btn btn-primary"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <div className="spinner-sm-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" style={{width:'16px',height:'16px'}}>
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Créer le Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
