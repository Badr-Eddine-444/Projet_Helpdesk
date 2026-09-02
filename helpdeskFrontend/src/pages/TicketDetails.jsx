import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTicketById,
  getCommentairesByTicket,
  ajouterCommentaire,
  getAttachmentsByTicket,
  uploaderFichier,
  telechargerFichier,
  getHistoriqueByTicket,
} from '../services/api';
import api from '../services/api';
import './TicketDetails.css';

// ── Mappings identiques au Dashboard ─────────────────────────────────────────
const PRIORITY_CONFIG = {
  HIGH:   { label: 'Haute',   class: 'priority-high' },
  MEDIUM: { label: 'Moyenne', class: 'priority-medium' },
  LOW:    { label: 'Basse',   class: 'priority-low' },
};

const STATUS_CONFIG = {
  NEW:         { label: 'Nouveau',   class: 'status-open',     icon: '🆕' },
  ASSIGNED:    { label: 'Assigné',   class: 'status-open',     icon: '👤' },
  IN_PROGRESS: { label: 'En cours',  class: 'status-progress', icon: '⚙️' },
  RESOLVED:    { label: 'Résolu',    class: 'status-resolved', icon: '✅' },
  CLOSED:      { label: 'Fermé',     class: 'status-closed',   icon: '🔒' },
};

const STATUS_OPTIONS = [
  { value: 'NEW',         label: 'Nouveau' },
  { value: 'ASSIGNED',    label: 'Assigné' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED',    label: 'Résolu' },
  { value: 'CLOSED',      label: 'Fermé' },
];

// ── Helper : formater une date ───────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) + ' à ' + d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Helper : taille lisible ──────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / 1048576).toFixed(1) + ' Mo';
};

// ── Icône fichier par type MIME ──────────────────────────────────────────────
const getFileIcon = (type) => {
  if (!type) return '📎';
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
  return '📎';
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Utilisateur connecté ───────────────────────────────────────────────────
  const currentUserId = Number(localStorage.getItem('id'));
  const currentUserName = localStorage.getItem('nom') || 'Moi';
  const role = localStorage.getItem('role') ?? '';
  const isAdmin = role === 'ADMIN';
  const isSupport = role === 'SUPPORT';
  const isTechOrAdmin = isSupport || isAdmin;

  // ── States ─────────────────────────────────────────────────────────────────
  const [ticket, setTicket] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Onglet actif ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('discussion');

  // ── Formulaire commentaire ─────────────────────────────────────────────────
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Chargement des données ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketRes, commRes, attachRes, histRes] = await Promise.all([
        getTicketById(id),
        getCommentairesByTicket(id),
        getAttachmentsByTicket(id),
        getHistoriqueByTicket(id),
      ]);
      setTicket(ticketRes.data);
      setCommentaires(commRes.data);
      setAttachments(attachRes.data);
      setHistorique(histRes.data);
    } catch (err) {
      setError('Impossible de charger les détails du ticket.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-scroll vers le bas du chat
  useEffect(() => {
    if (activeTab === 'discussion') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commentaires, activeTab]);

  // ── Envoi d'un commentaire ─────────────────────────────────────────────────
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSendingComment(true);
    try {
      const { data } = await ajouterCommentaire(id, currentUserId, newComment.trim());
      setCommentaires((prev) => [...prev, data]);
      setNewComment('');
    } catch (err) {
      showToast("Erreur lors de l'envoi du commentaire.");
      console.error(err);
    } finally {
      setSendingComment(false);
    }
  };

  // ── Upload de fichier ──────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data } = await uploaderFichier(id, currentUserId, file);
      setAttachments((prev) => [...prev, data]);
      showToast('Fichier uploadé avec succès !', 'success');
    } catch (err) {
      showToast("Erreur lors de l'upload du fichier.");
      console.error(err);
    } finally {
      setUploading(false);
      // Reset l'input file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Téléchargement de fichier ──────────────────────────────────────────────
  const handleDownload = async (attachment) => {
    try {
      const response = await telechargerFichier(attachment.cheminLocal);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.nomFichier);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Erreur lors du téléchargement.');
      console.error(err);
    }
  };

  // ── Changement de statut (avec audit) ──────────────────────────────────────
  const handleStatutChange = async (newStatut) => {
    try {
      await api.put(`/tickets/${id}/statut?statut=${newStatut}&userId=${currentUserId}`);
      setTicket((prev) => ({ ...prev, statut: newStatut }));
      // Recharger l'historique
      const { data } = await getHistoriqueByTicket(id);
      setHistorique(data);
      showToast('Statut mis à jour avec succès.', 'success');
    } catch (err) {
      showToast('Erreur lors de la mise à jour du statut.');
      console.error(err);
    }
  };

  // ── Rendu : Loading / Erreur ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="td-page">
        <div className="td-loading">
          <div className="spinner"></div>
          <p>Chargement du ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="td-page">
        <div className="td-error">
          <p>{error || 'Ticket introuvable.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pConf = PRIORITY_CONFIG[ticket.priorite] || { label: ticket.priorite, class: '' };
  const sConf = STATUS_CONFIG[ticket.statut] || { label: ticket.statut, class: '', icon: '📋' };
  const creatorName = ticket.createur?.nom || 'Inconnu';
  const technicianName = ticket.technicien?.nom || 'Non assigné';

  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="td-page">
      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="td-header">
        <button className="td-back-btn" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour
        </button>
        <div className="td-header-info">
          <h1 className="td-ticket-title">
            <span className="td-ticket-id">#{ticket.id}</span>
            {ticket.titre}
          </h1>
          <div className="td-meta-row">
            <span className={`badge ${pConf.class}`}>{pConf.label}</span>
            <span className={`badge ${sConf.class}`}>{sConf.icon} {sConf.label}</span>
            <span className="td-meta-text">Créé par <strong>{creatorName}</strong></span>
            <span className="td-meta-text">le {formatDate(ticket.dateCreation)}</span>
          </div>
        </div>
      </div>

      {/* ── Layout principal (2 colonnes) ────────────────────────────────────── */}
      <div className="td-layout">

        {/* ── Colonne gauche : Discussion + Attachments ───────────────────────── */}
        <div className="td-main-col">

          {/* ── Tabs ─────────────────────────────────────────────────────────── */}
          <div className="td-tabs">
            <button
              className={`td-tab ${activeTab === 'discussion' ? 'td-tab-active' : ''}`}
              onClick={() => setActiveTab('discussion')}
            >
              <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Discussion
              {commentaires.length > 0 && <span className="td-tab-count">{commentaires.length}</span>}
            </button>
            <button
              className={`td-tab ${activeTab === 'attachments' ? 'td-tab-active' : ''}`}
              onClick={() => setActiveTab('attachments')}
            >
              <svg viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Fichiers
              {attachments.length > 0 && <span className="td-tab-count">{attachments.length}</span>}
            </button>
            <button
              className={`td-tab ${activeTab === 'historique' ? 'td-tab-active' : ''}`}
              onClick={() => setActiveTab('historique')}
            >
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Activité
              {historique.length > 0 && <span className="td-tab-count">{historique.length}</span>}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB : DISCUSSION                                                   */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'discussion' && (
            <div className="td-chat-section">
              {/* ── Messages ─────────────────────────────────────────────────── */}
              <div className="td-chat-messages">
                {commentaires.length === 0 ? (
                  <div className="td-chat-empty">
                    <svg viewBox="0 0 24 24" fill="none" style={{width:'48px',height:'48px',color:'var(--text-muted)'}}>
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>Aucun message pour le moment.</p>
                    <span>Commencez la discussion ci-dessous.</span>
                  </div>
                ) : (
                  commentaires.map((c) => {
                    const isMe = Number(c.auteur?.id) === currentUserId;
                    return (
                      <div key={c.id} className={`td-chat-bubble ${isMe ? 'td-bubble-mine' : 'td-bubble-other'}`}>
                        <div className="td-bubble-header">
                          <span className="td-bubble-author">
                            {isMe ? 'Moi' : (c.auteur?.nom || 'Utilisateur')}
                          </span>
                          <span className="td-bubble-role">
                            {c.auteur?.role === 'SUPPORT' ? '🛠 Support' : c.auteur?.role === 'ADMIN' ? '👑 Admin' : '👤 Utilisateur'}
                          </span>
                        </div>
                        <p className="td-bubble-text">{c.texte}</p>
                        <span className="td-bubble-time">{formatDate(c.dateAjout)}</span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ── Formulaire d'envoi ────────────────────────────────────────── */}
              <form className="td-chat-form" onSubmit={handleSendComment}>
                <input
                  type="text"
                  className="td-chat-input"
                  placeholder="Tapez votre message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={sendingComment}
                />
                <button type="submit" className="btn btn-primary td-send-btn" disabled={sendingComment || !newComment.trim()}>
                  {sendingComment ? (
                    <div className="spinner-sm"></div>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  Envoyer
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB : FICHIERS ATTACHÉS                                            */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'attachments' && (
            <div className="td-attachments-section">
              {/* ── Upload ───────────────────────────────────────────────────── */}
              <div className="td-upload-zone">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  className="td-file-input"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className={`td-upload-label ${uploading ? 'td-uploading' : ''}`}>
                  {uploading ? (
                    <>
                      <div className="spinner-sm"></div>
                      <span>Upload en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" style={{width:'32px',height:'32px'}}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="td-upload-text">Cliquez ou déposez un fichier ici</span>
                      <span className="td-upload-hint">Images, PDF, documents — max 10 Mo</span>
                    </>
                  )}
                </label>
              </div>

              {/* ── Liste des fichiers ────────────────────────────────────────── */}
              {attachments.length === 0 ? (
                <div className="td-empty-state">
                  <p>Aucune pièce jointe pour le moment.</p>
                </div>
              ) : (
                <div className="td-files-list">
                  {attachments.map((a) => (
                    <div key={a.id} className="td-file-card" onClick={() => handleDownload(a)}>
                      <div className="td-file-icon">{getFileIcon(a.typeFichier)}</div>
                      <div className="td-file-info">
                        <span className="td-file-name">{a.nomFichier}</span>
                        <span className="td-file-meta">
                          {formatFileSize(a.tailleFichier)} • {a.uploader?.nom || 'Inconnu'} • {formatDate(a.dateUpload)}
                        </span>
                      </div>
                      <svg className="td-file-download-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB : HISTORIQUE / TIMELINE                                        */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'historique' && (
            <div className="td-history-section">
              {historique.length === 0 ? (
                <div className="td-empty-state">
                  <p>Aucun changement de statut enregistré.</p>
                </div>
              ) : (
                <div className="td-timeline">
                  {historique.map((h, index) => {
                    const fromConf = STATUS_CONFIG[h.ancienStatut] || { label: h.ancienStatut, class: '', icon: '📋' };
                    const toConf = STATUS_CONFIG[h.nouveauStatut] || { label: h.nouveauStatut, class: '', icon: '📋' };
                    return (
                      <div key={h.id} className="td-timeline-item">
                        <div className="td-timeline-marker">
                          <div className={`td-timeline-dot ${index === 0 ? 'td-dot-active' : ''}`}></div>
                          {index < historique.length - 1 && <div className="td-timeline-line"></div>}
                        </div>
                        <div className="td-timeline-content">
                          <div className="td-timeline-event">
                            <strong>{h.modifiePar?.nom || 'Système'}</strong>
                            <span> a changé le statut de </span>
                            <span className={`badge badge-sm ${fromConf.class}`}>{fromConf.icon} {fromConf.label}</span>
                            <span> → </span>
                            <span className={`badge badge-sm ${toConf.class}`}>{toConf.icon} {toConf.label}</span>
                          </div>
                          <span className="td-timeline-date">{formatDate(h.dateModification)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Colonne droite : Informations du ticket ─────────────────────────── */}
        <div className="td-sidebar">
          <div className="td-sidebar-card">
            <h3 className="td-sidebar-title">Informations</h3>

            {/* Statut (modifiable si ADMIN ou SUPPORT assigné) */}
            <div className="td-info-row">
              <span className="td-info-label">Statut</span>
              {(isAdmin || (isSupport && Number(ticket.technicien?.id) === currentUserId)) ? (
                <select
                  className={`inline-select status-select ${sConf.class}`}
                  value={ticket.statut}
                  onChange={(e) => handleStatutChange(e.target.value)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <span className={`badge ${sConf.class}`}>{sConf.icon} {sConf.label}</span>
              )}
            </div>

            <div className="td-info-row">
              <span className="td-info-label">Priorité</span>
              <span className={`badge ${pConf.class}`}>{pConf.label}</span>
            </div>

            <div className="td-info-row">
              <span className="td-info-label">Créateur</span>
              <span className="td-info-value">{creatorName}</span>
            </div>

            <div className="td-info-row">
              <span className="td-info-label">Technicien</span>
              <span className="td-info-value">{technicianName}</span>
            </div>

            <div className="td-info-row">
              <span className="td-info-label">Créé le</span>
              <span className="td-info-value td-info-date">{formatDate(ticket.dateCreation)}</span>
            </div>
          </div>

          {/* ── Description ──────────────────────────────────────────────────── */}
          <div className="td-sidebar-card">
            <h3 className="td-sidebar-title">Description</h3>
            <p className="td-description-text">{ticket.description || 'Aucune description fournie.'}</p>
          </div>

          {/* ── Raccourcis rapides ────────────────────────────────────────────── */}
          <div className="td-sidebar-card td-quick-stats">
            <div className="td-quick-stat">
              <span className="td-quick-value">{commentaires.length}</span>
              <span className="td-quick-label">Messages</span>
            </div>
            <div className="td-quick-stat">
              <span className="td-quick-value">{attachments.length}</span>
              <span className="td-quick-label">Fichiers</span>
            </div>
            <div className="td-quick-stat">
              <span className="td-quick-value">{historique.length}</span>
              <span className="td-quick-label">Événements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
