package ma.helpdeskBackend.controllers;

import ma.helpdeskBackend.entities.Ticket;
import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.entities.StatutTicket;
import ma.helpdeskBackend.repositories.TicketRepository;
import ma.helpdeskBackend.repositories.UserRepository;
import ma.helpdeskBackend.services.TicketService;
import ma.helpdeskBackend.services.TicketHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin("*")
public class TicketController {

    private final TicketService ticketService;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketHistoryService ticketHistoryService;

    // Injection propre via le constructeur pour tous les services et repositories
    public TicketController(TicketService ticketService, TicketRepository ticketRepository,
                            UserRepository userRepository, TicketHistoryService ticketHistoryService) {
        this.ticketService = ticketService;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketHistoryService = ticketHistoryService;
    }

    /**
     * GET /api/tickets
     * Recupere la liste de tous les tickets.
     */
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * GET /api/tickets/{id}
     * Recupere un ticket spécifique par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + id));
        return ResponseEntity.ok(ticket);
    }

    /**
     * POST /api/tickets?createurId={id}
     * Cree un nouveau ticket pour l'utilisateur dont l'ID est passe en parametre.
     */
    @PostMapping
    public ResponseEntity<Ticket> creerTicket(
            @RequestBody Ticket ticket,
            @RequestParam Long createurId) {
        Ticket nouveauTicket = ticketService.creerTicket(ticket, createurId);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveauTicket);
    }

    /**
     * DELETE /api/tickets/{id}
     * Supprime le ticket correspondant a l'ID fourni.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerTicket(@PathVariable Long id) {
        ticketService.supprimerTicket(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/tickets/{id}/assigner?technicienId={id}
     * Assigne un technicien a un ticket spécifique.
     * Enregistre automatiquement le changement de statut dans l'historique.
     */
    @PutMapping("/{id}/assigner")
    public ResponseEntity<Ticket> assignerTechnicien(@PathVariable Long id,
                                                      @RequestParam Long technicienId) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        User technicien = userRepository.findById(technicienId).orElseThrow();

        StatutTicket ancienStatut = ticket.getStatut();

        ticket.setTechnicien(technicien);
        ticket.setStatut(StatutTicket.ASSIGNED);

        Ticket ticketSauvegarde = ticketRepository.save(ticket);

        // Enregistrer le changement dans l'historique d'audit
        if (ancienStatut != StatutTicket.ASSIGNED) {
            ticketHistoryService.enregistrerChangement(ticketSauvegarde, technicien,
                    ancienStatut, StatutTicket.ASSIGNED);
        }

        return ResponseEntity.ok(ticketSauvegarde);
    }

    /**
     * PUT /api/tickets/{id}/statut?statut={STATUT}&userId={id}
     * Change le statut d'un ticket et enregistre automatiquement l'historique d'audit.
     *
     * @param id     L'identifiant du ticket
     * @param statut Le nouveau statut souhaité
     * @param userId L'identifiant de l'utilisateur qui effectue le changement
     */
    @PutMapping("/{id}/statut")
    public ResponseEntity<Ticket> changerStatut(@PathVariable Long id,
                                                 @RequestParam StatutTicket statut,
                                                 @RequestParam Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + id));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'ID : " + userId));

        StatutTicket ancienStatut = ticket.getStatut();

        // Ne rien faire si le statut n'a pas changé
        if (ancienStatut == statut) {
            return ResponseEntity.ok(ticket);
        }

        ticket.setStatut(statut);
        Ticket ticketSauvegarde = ticketRepository.save(ticket);

        // Créer automatiquement une entrée dans l'historique d'audit
        ticketHistoryService.enregistrerChangement(ticketSauvegarde, user, ancienStatut, statut);

        return ResponseEntity.ok(ticketSauvegarde);
    }
}