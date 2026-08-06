package ma.helpdeskBackend.controllers;

import ma.helpdeskBackend.entities.Ticket;
import ma.helpdeskBackend.services.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin("*")
public class TicketController {

    private final TicketService ticketService;

    // Injection via le constructeur (sans @Autowired)
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
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
     * POST /api/tickets?createurId={id}
     * Cree un nouveau ticket pour l'utilisateur dont l'ID est passe en parametre.
     *
     * @param ticket      Le corps de la requete JSON contenant les infos du ticket
     * @param createurId  L'identifiant de l'utilisateur createur (passe en query param)
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
     *
     * @param id L'identifiant du ticket a supprimer
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerTicket(@PathVariable Long id) {
        ticketService.supprimerTicket(id);
        return ResponseEntity.noContent().build();
    }
}
