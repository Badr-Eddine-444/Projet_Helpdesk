package ma.helpdeskBackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nom original du fichier uploadé (ex: "capture_ecran.png")
    @Column(nullable = false)
    private String nomFichier;

    // Type MIME du fichier (ex: "image/png", "application/pdf")
    @Column(nullable = false)
    private String typeFichier;

    // Chemin de stockage local sur le serveur (ex: "./uploads/abc123_capture.png")
    @Column(nullable = false)
    private String cheminLocal;

    // Taille du fichier en octets
    private Long tailleFichier;

    // Le ticket auquel cette pièce jointe est rattachée
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Ticket ticket;

    // L'utilisateur qui a uploadé le fichier
    @ManyToOne
    @JoinColumn(name = "uploader_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User uploader;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateUpload;

    @PrePersist
    protected void onCreate() {
        this.dateUpload = LocalDateTime.now();
    }
}
