package ma.helpdeskBackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Le ticket concerné par le changement
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Ticket ticket;

    // L'utilisateur qui a effectué le changement de statut
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User modifiePar;

    // L'ancien statut avant la modification
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTicket ancienStatut;

    // Le nouveau statut après la modification
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTicket nouveauStatut;

    // Date et heure exactes du changement
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateModification;

    @PrePersist
    protected void onCreate() {
        this.dateModification = LocalDateTime.now();
    }
}
