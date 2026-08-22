package ma.helpdeskBackend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Désactiver CSRF car nous utiliserons des tokens JWT (Stateless)
                .csrf(csrf -> csrf.disable())
                // 2. Autoriser le CORS (pour que ton React sur le port 5173 puisse parler au port 8080)
                .cors(Customizer.withDefaults())
                // 3. Configuration des règles d'accès aux routes
                .authorizeHttpRequests(auth -> auth
                        // Autoriser tout le monde à accéder à la route de login (qu'on va créer juste après)
                        .requestMatchers("/api/auth/**").permitAll()
                        // Toutes les autres requêtes (tickets, users...) exigent d'être connecté
                        .anyRequest().authenticated()
                )
                // 4. On indique à Spring Security de ne pas garder de session en mémoire (car le JWT fait tout le travail)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
// On place notre vigile juste avant le système de sécurité par défaut de Spring
        http.addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Bean pour hacher les mots de passe (Personne ne doit voir les mots de passe en clair dans la BDD !)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}