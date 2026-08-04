package ma.helpdeskBackend.repositories;

import ma.helpdeskBackend.entities.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Pour trouver tous les tickets créés par un employé spécifique
    List<Ticket> findByCreateurId(Long createurId);

    // Pour trouver tous les tickets assignés à un technicien spécifique
    List<Ticket> findByTechnicienId(Long technicienId);
}