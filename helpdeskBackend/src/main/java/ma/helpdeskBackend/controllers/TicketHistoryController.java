package ma.helpdeskBackend.controllers;

import ma.helpdeskBackend.entities.TicketHistory;
import ma.helpdeskBackend.services.TicketHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin("*")
public class TicketHistoryController {

    private final TicketHistoryService ticketHistoryService;

    public TicketHistoryController(TicketHistoryService ticketHistoryService) {
        this.ticketHistoryService = ticketHistoryService;
    }

    /**
     * GET /api/tickets/{ticketId}/historique
     * Récupère tout l'historique des changements de statut d'un ticket.
     *
     * @param ticketId L'identifiant du ticket
     * @return La liste chronologique (desc) des événements d'audit
     */
    @GetMapping("/{ticketId}/historique")
    public ResponseEntity<List<TicketHistory>> getHistorique(@PathVariable Long ticketId) {
        List<TicketHistory> historique = ticketHistoryService.getHistoriqueByTicket(ticketId);
        return ResponseEntity.ok(historique);
    }
}
