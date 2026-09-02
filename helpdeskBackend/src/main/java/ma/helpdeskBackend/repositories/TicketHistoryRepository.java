package ma.helpdeskBackend.repositories;

import ma.helpdeskBackend.entities.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    // Récupérer tout l'historique d'un ticket, trié du plus récent au plus ancien
    List<TicketHistory> findByTicketIdOrderByDateModificationDesc(Long ticketId);
}
