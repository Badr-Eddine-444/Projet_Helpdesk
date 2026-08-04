package ma.helpdeskBackend.services;

import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Injection de dépendance : on connecte le Service au Repository
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * MISSION 1 : Récupérer la liste de tous les utilisateurs de la base de données.
     */
    public List<User> getAllUsers() {
        // findAll() va chercher toutes les lignes de la table "utilisateurs"
        return userRepository.findAll();
    }

    /**
     * MISSION 2 : Trouver un utilisateur spécifique grâce à son ID.
     */
    public Optional<User> getUserById(Long id) {
        // findById() cherche une ligne précise grâce à la clé primaire
        return userRepository.findById(id);
    }

    /**
     * MISSION 3 : Sauvegarder un nouvel utilisateur dans la base de données.
     */
    public User creerUtilisateur(User nouvelUtilisateur) {
        // save() exécute la requête SQL "INSERT INTO utilisateurs..."
        return userRepository.save(nouvelUtilisateur);
    }

    /**
     * MISSION 4 : Supprimer un utilisateur grâce à son ID.
     */
    public void supprimerUtilisateur(Long id) {
        // deleteById() exécute la requête SQL "DELETE FROM utilisateurs WHERE id = ?"
        userRepository.deleteById(id);
    }
}