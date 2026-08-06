package ma.helpdeskBackend.controllers;

import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users
     * Récupère tous les utilisateurs
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * POST /api/users
     * Crée un nouvel utilisateur
     */
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User nouvelUtilisateur = userService.creerUtilisateur(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouvelUtilisateur);
    }

    /**
     * DELETE /api/users/{id}
     * Supprime un utilisateur
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerUtilisateur(@PathVariable Long id) {
        userService.supprimerUtilisateur(id);
        return ResponseEntity.noContent().build();
    }
}