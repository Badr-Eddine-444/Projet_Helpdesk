package ma.helpdeskBackend.controllers;

import ma.helpdeskBackend.entities.Attachment;
import ma.helpdeskBackend.services.AttachmentService;
import ma.helpdeskBackend.services.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin("*")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final FileStorageService fileStorageService;

    public AttachmentController(AttachmentService attachmentService,
                                FileStorageService fileStorageService) {
        this.attachmentService = attachmentService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * POST /api/tickets/{ticketId}/attachments?uploaderId={id}
     * Uploade un fichier et l'associe à un ticket.
     *
     * @param ticketId   L'identifiant du ticket
     * @param uploaderId L'identifiant de l'utilisateur qui uploade
     * @param file       Le fichier uploadé (multipart/form-data)
     */
    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<Attachment> uploaderFichier(
            @PathVariable Long ticketId,
            @RequestParam Long uploaderId,
            @RequestParam("file") MultipartFile file) {
        Attachment attachment = attachmentService.uploaderFichier(file, ticketId, uploaderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    /**
     * GET /api/tickets/{ticketId}/attachments
     * Récupère la liste des pièces jointes d'un ticket.
     *
     * @param ticketId L'identifiant du ticket
     */
    @GetMapping("/{ticketId}/attachments")
    public ResponseEntity<List<Attachment>> getAttachments(@PathVariable Long ticketId) {
        List<Attachment> attachments = attachmentService.getAttachmentsByTicket(ticketId);
        return ResponseEntity.ok(attachments);
    }

    /**
     * GET /api/tickets/attachments/download/{nomFichier}
     * Télécharge un fichier par son nom de stockage.
     *
     * @param nomFichier Le nom unique du fichier stocké sur le serveur
     */
    @GetMapping("/attachments/download/{nomFichier:.+}")
    public ResponseEntity<Resource> telechargerFichier(@PathVariable String nomFichier) {
        try {
            Path filePath = fileStorageService.chargerFichier(nomFichier);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Déterminer le Content-Type du fichier
            String contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * DELETE /api/tickets/attachments/{id}
     * Supprime une pièce jointe (fichier + enregistrement BDD).
     *
     * @param id L'identifiant de la pièce jointe
     */
    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Void> supprimerAttachment(@PathVariable Long id) {
        attachmentService.supprimerAttachment(id);
        return ResponseEntity.noContent().build();
    }
}
