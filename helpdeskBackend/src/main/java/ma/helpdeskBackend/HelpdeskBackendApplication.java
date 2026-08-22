package ma.helpdeskBackend;

import ma.helpdeskBackend.entities.Role;
import ma.helpdeskBackend.entities.User;
import ma.helpdeskBackend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class HelpdeskBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelpdeskBackendApplication.class, args);
	}

	// Ce code s'exécute tout seul à chaque démarrage du serveur
	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// On vérifie si l'admin existe déjà pour ne pas le créer en double
			if (userRepository.findByEmail("admin@entreprise.com").isEmpty()) {
				User admin = new User();
				admin.setNom("Directeur IT");
				admin.setEmail("admin@entreprise.com");
				// On crypte le mot de passe avant de sauvegarder !
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setRole(Role.ADMIN);

				userRepository.save(admin);
				System.out.println("========== COMPTE ADMIN CRÉÉ AVEC SUCCÈS ! ==========");
			}
		};
	}
}