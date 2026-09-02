package ma.helpdeskBackend.repositories;

import ma.helpdeskBackend.entities.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    // Récupérer toutes les pièces jointes d'un ticket précis
    List<Attachment> findByTicketId(Long ticketId);
}
