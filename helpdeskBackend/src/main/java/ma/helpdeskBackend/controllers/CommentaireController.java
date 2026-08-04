package ma.helpdeskBackend.controllers;

import ma.helpdeskBackend.entities.Commentaire;
import ma.helpdeskBackend.services.CommentaireService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commentaires")
@CrossOrigin("*")
public class CommentaireController {

    private final CommentaireService commentaireService;

    // Injection via le constructeur (sans @Autowired)
    public CommentaireController(CommentaireService commentaireService) {
        this.commentaireService = commentaireService;
    }

    /**
     * GET /api/commentaires
     * Recupere tous les commentaires (tous tickets confondus).
     */
    @GetMapping
    public ResponseEntity<List<Commentaire>> getAllCommentaires() {
        List<Commentaire> commentaires = commentaireService.getAllCommentaires();
        return ResponseEntity.ok(commentaires);
    }

    /**
     * GET /api/commentaires/ticket/{ticketId}
     * Recupere tous les commentaires associes a un ticket precis.
     *
     * @param ticketId L'identifiant du ticket dont on veut l'historique de commentaires
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<Commentaire>> getCommentairesByTicket(@PathVariable Long ticketId) {
        List<Commentaire> commentaires = commentaireService.getCommentairesByTicket(ticketId);
        return ResponseEntity.ok(commentaires);
    }

    /**
     * POST /api/commentaires?ticketId={id}&auteurId={id}
     * Ajoute un nouveau commentaire sur un ticket.
     *
     * @param commentaire Le corps de la requete JSON avec le texte du commentaire
     * @param ticketId    L'identifiant du ticket cible
     * @param auteurId    L'identifiant de l'utilisateur qui poste le commentaire
     */
    @PostMapping
    public ResponseEntity<Commentaire> ajouterCommentaire(
            @RequestBody Commentaire commentaire,
            @RequestParam Long ticketId,
            @RequestParam Long auteurId) {
        Commentaire nouveauCommentaire = commentaireService.ajouterCommentaire(commentaire, ticketId, auteurId);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveauCommentaire);
    }

    /**
     * DELETE /api/commentaires/{id}
     * Supprime le commentaire correspondant a l'ID fourni.
     *
     * @param id L'identifiant du commentaire a supprimer
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCommentaire(@PathVariable Long id) {
        commentaireService.supprimerCommentaire(id);
        return ResponseEntity.noContent().build();
    }
}
