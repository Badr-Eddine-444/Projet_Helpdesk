package ma.helpdeskBackend.services;

import ma.helpdeskBackend.entities.Attachment;
import ma.helpdeskBackend.entities.Ticket;
import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.repositories.AttachmentRepository;
import ma.helpdeskBackend.repositories.TicketRepository;
import ma.helpdeskBackend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             TicketRepository ticketRepository,
                             UserRepository userRepository,
                             FileStorageService fileStorageService) {
        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload un fichier et l'associe à un ticket.
     *
     * @param file       Le fichier uploadé
     * @param ticketId   L'identifiant du ticket
     * @param uploaderId L'identifiant de l'utilisateur qui uploade
     * @return L'entité Attachment créée
     */
    public Attachment uploaderFichier(MultipartFile file, Long ticketId, Long uploaderId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Erreur : Ce ticket n'existe pas dans la base"));

        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("Erreur : Cet utilisateur n'existe pas dans la base"));

        // Stocker le fichier physiquement sur le disque
        String nomFichierStocke = fileStorageService.stockerFichier(file);

        // Créer l'enregistrement en base de données
        Attachment attachment = new Attachment();
        attachment.setNomFichier(file.getOriginalFilename());
        attachment.setTypeFichier(file.getContentType());
        attachment.setCheminLocal(nomFichierStocke);
        attachment.setTailleFichier(file.getSize());
        attachment.setTicket(ticket);
        attachment.setUploader(uploader);

        return attachmentRepository.save(attachment);
    }

    /**
     * Récupère toutes les pièces jointes d'un ticket.
     *
     * @param ticketId L'identifiant du ticket
     * @return La liste des pièces jointes
     */
    public List<Attachment> getAttachmentsByTicket(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

    /**
     * Supprime une pièce jointe (fichier physique + enregistrement BDD).
     *
     * @param attachmentId L'identifiant de la pièce jointe
     */
    public void supprimerAttachment(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Erreur : Cette pièce jointe n'existe pas"));

        // Supprimer le fichier physique
        fileStorageService.supprimerFichier(attachment.getCheminLocal());

        // Supprimer l'enregistrement en BDD
        attachmentRepository.delete(attachment);
    }
}
