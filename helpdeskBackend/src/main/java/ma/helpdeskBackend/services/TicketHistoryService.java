package ma.helpdeskBackend.services;

import ma.helpdeskBackend.entities.StatutTicket;
import ma.helpdeskBackend.entities.Ticket;
import ma.helpdeskBackend.entities.TicketHistory;
import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.repositories.TicketHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketHistoryService {

    private final TicketHistoryRepository ticketHistoryRepository;

    public TicketHistoryService(TicketHistoryRepository ticketHistoryRepository) {
        this.ticketHistoryRepository = ticketHistoryRepository;
    }

    /**
     * Enregistre automatiquement une entrée d'historique lors d'un changement de statut.
     *
     * @param ticket        Le ticket concerné
     * @param modifiePar    L'utilisateur qui effectue le changement
     * @param ancienStatut  Le statut avant modification
     * @param nouveauStatut Le nouveau statut après modification
     * @return L'entrée d'historique créée
     */
    public TicketHistory enregistrerChangement(Ticket ticket, User modifiePar,
                                                StatutTicket ancienStatut, StatutTicket nouveauStatut) {
        TicketHistory history = new TicketHistory();
        history.setTicket(ticket);
        history.setModifiePar(modifiePar);
        history.setAncienStatut(ancienStatut);
        history.setNouveauStatut(nouveauStatut);

        return ticketHistoryRepository.save(history);
    }

    /**
     * Récupère tout l'historique d'un ticket, du plus récent au plus ancien.
     *
     * @param ticketId L'identifiant du ticket
     * @return La liste chronologique (desc) des changements de statut
     */
    public List<TicketHistory> getHistoriqueByTicket(Long ticketId) {
        return ticketHistoryRepository.findByTicketIdOrderByDateModificationDesc(ticketId);
    }
}
