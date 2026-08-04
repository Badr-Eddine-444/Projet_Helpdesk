package ma.helpdeskBackend.repositories;

import ma.helpdeskBackend.entities.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    // Pour récupérer tout l'historique de discussion d'un ticket précis
    List<Commentaire> findByTicketId(Long ticketId);
}