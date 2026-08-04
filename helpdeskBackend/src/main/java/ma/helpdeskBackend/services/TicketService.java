package ma.helpdeskBackend.services;

import ma.helpdeskBackend.entities.Ticket;
import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.entities.StatutTicket;
import ma.helpdeskBackend.repositories.TicketRepository;
import ma.helpdeskBackend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Cette annotation est obligatoire, elle dit à Spring Boot : "Ceci est le cerveau métier"
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // Injection des dépendances : on donne au Service accès aux Repositories
    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // 1. Méthode pour voir tous les tickets de l'entreprise
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // 2. Méthode métier : Créer un nouveau ticket
    public Ticket creerTicket(Ticket ticket, Long createurId) {
        // On cherche l'utilisateur dans la base de données grâce à son ID
        User createur = userRepository.findById(createurId)
                .orElseThrow(() -> new RuntimeException("Erreur : Cet utilisateur n'existe pas dans la base"));

        // On relie le ticket à son créateur
        ticket.setCreateur(createur);

        // On force le statut à "NEW" par sécurité
        ticket.setStatut(StatutTicket.NEW);

        // On sauvegarde le tout dans la base de données via le Repository
        return ticketRepository.save(ticket);
    }

    // 3. Méthode métier : Supprimer un ticket par son ID
    public void supprimerTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}