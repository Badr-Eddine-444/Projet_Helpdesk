package ma.helpdeskBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priorite priorite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTicket statut = StatutTicket.NEW;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    // L'employé qui a créé le ticket
    @ManyToOne
    @JoinColumn(name = "createur_id", nullable = false)
    private User createur;

    // Le technicien assigné (peut être vide au début)
    @ManyToOne
    @JoinColumn(name = "technicien_id")
    private User technicien;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}