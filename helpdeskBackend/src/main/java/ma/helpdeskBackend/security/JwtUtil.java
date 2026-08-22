package ma.helpdeskBackend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // La clé cryptographique (elle doit faire au moins 256 bits).
    // En vraie entreprise, on la cache dans le fichier application.properties !
    private final String SECRET_KEY = "ProjetHelpdeskEmsi4IIR2026SecretKeyUltraSecurisee";

    // Le passeport est valable 24 heures (en millisecondes)
    private final long EXPIRATION_TIME = 86400000;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // 1. Fabriquer le jeton (Le passeport) quand l'utilisateur se connecte
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // On tamponne le rôle exact sur le passeport
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Lire l'email écrit sur le jeton
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. Vérifier si le jeton est authentique et non expiré
    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false; // Le jeton est faux, expiré, ou a été trafiqué
        }
    }
}