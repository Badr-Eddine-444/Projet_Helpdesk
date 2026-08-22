package ma.helpdeskBackend.controllers;

import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.repositories.UserRepository;
import ma.helpdeskBackend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        // 1. Chercher l'utilisateur par son email
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }

        User user = userOptional.get();

        // 2. Vérifier le mot de passe
        // /!\ IMPORTANT : On utilise .matches() car les mots de passe DOIVENT être hachés en BDD
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }

        // 3. Si tout est bon, on génère le jeton JWT
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        // 4. On renvoie le jeton et les infos au frontend React
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("nom", user.getNom());
        response.put("role", user.getRole());

        // Si tu as ajouté le champ "canManageUsers" tout à l'heure dans ton modèle User, ajoute-le ici :
        // response.put("canManageUsers", user.isCanManageUsers());

        return ResponseEntity.ok(response);
    }

    // --- DTO (Data Transfer Object) pour lire la requête JSON ---
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}