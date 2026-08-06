package ma.helpdeskBackend.services;

import ma.helpdeskBackend.entities.Commentaire;
import ma.helpdeskBackend.entities.Ticket;
import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.repositories.CommentaireRepository;
import ma.helpdeskBackend.repositories.TicketRepository;
import ma.helpdeskBackend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // Injection des dependances via le constructeur
    public CommentaireService(CommentaireRepository commentaireRepository,
                              TicketRepository ticketRepository,
                              UserRepository userRepository) {
        this.commentaireRepository = commentaireRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // 1. Recuperer tous les commentaires d'un ticket precis
    public List<Commentaire> getCommentairesByTicket(Long ticketId) {
        return commentaireRepository.findByTicketId(ticketId);
    }

    // 2. Recuperer tous les commentaires (tous tickets confondus)
    public List<Commentaire> getAllCommentaires() {
        return commentaireRepository.findAll();
    }

    // 3. Creer un nouveau commentaire sur un ticket
    public Commentaire ajouterCommentaire(Commentaire commentaire, Long ticketId, Long auteurId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Erreur : Ce ticket n'existe pas dans la base"));

        User auteur = userRepository.findById(auteurId)
                .orElseThrow(() -> new RuntimeException("Erreur : Cet utilisateur n'existe pas dans la base"));

        commentaire.setTicket(ticket);
        commentaire.setAuteur(auteur);

        return commentaireRepository.save(commentaire);
    }

    // 4. Supprimer un commentaire par son ID
    public void supprimerCommentaire(Long id) {
        commentaireRepository.deleteById(id);
    }
}
