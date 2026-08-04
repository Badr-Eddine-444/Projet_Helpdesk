package ma.helpdeskBackend.repositories;

import ma.helpdeskBackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Boot comprend tout seul qu'il doit chercher un utilisateur par son email
    Optional<User> findByEmail(String email);
}