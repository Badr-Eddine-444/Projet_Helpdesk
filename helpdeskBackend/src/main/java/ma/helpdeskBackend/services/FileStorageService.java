package ma.helpdeskBackend.services;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private Path uploadPath;

    /**
     * Initialisation : crée le dossier d'upload s'il n'existe pas encore.
     */
    @PostConstruct
    public void init() {
        try {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            System.out.println("========== Dossier d'uploads initialisé : " + uploadPath + " ==========");
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'uploads : " + uploadDir, e);
        }
    }

    /**
     * Sauvegarde un fichier sur le disque et retourne le nom de fichier unique généré.
     *
     * @param file Le fichier uploadé par l'utilisateur
     * @return Le nom de fichier unique (UUID + nom original)
     */
    public String stockerFichier(MultipartFile file) {
        try {
            // Validation de base
            if (file.isEmpty()) {
                throw new RuntimeException("Le fichier est vide.");
            }

            // Nettoyage du nom de fichier original
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                originalFilename = "fichier_inconnu";
            }

            // Génération d'un nom unique pour éviter les conflits (UUID + nom original)
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;

            // Copie du fichier vers le dossier d'uploads
            Path targetLocation = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage du fichier : " + file.getOriginalFilename(), e);
        }
    }

    /**
     * Charge un fichier depuis le dossier d'uploads.
     *
     * @param nomFichier Le nom du fichier stocké
     * @return Le chemin absolu vers le fichier
     */
    public Path chargerFichier(String nomFichier) {
        Path filePath = uploadPath.resolve(nomFichier).normalize();

        if (!Files.exists(filePath)) {
            throw new RuntimeException("Fichier introuvable : " + nomFichier);
        }

        return filePath;
    }

    /**
     * Supprime un fichier du dossier d'uploads.
     *
     * @param nomFichier Le nom du fichier à supprimer
     */
    public void supprimerFichier(String nomFichier) {
        try {
            Path filePath = uploadPath.resolve(nomFichier).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier : " + nomFichier, e);
        }
    }
}
