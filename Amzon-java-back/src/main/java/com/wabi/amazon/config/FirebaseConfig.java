package com.wabi.amazon.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FirebaseConfig {

    @Bean
    public Firestore firestore() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(loadCredentials())
                        .build();
                
                FirebaseApp.initializeApp(options);
                System.out.println(">>> FIREBASE: Successfully initialized FirebaseApp!");
            }
            return FirestoreClient.getFirestore();
        } catch (Exception e) {
            System.out.println(">>> FIREBASE CRITICAL EXCEPTION DURING INIT: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    private GoogleCredentials loadCredentials() throws IOException {
        String credentialsPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            Path path = Paths.get(credentialsPath);
            if (!Files.exists(path)) {
                throw new IOException("GOOGLE_APPLICATION_CREDENTIALS points to a missing file: " + credentialsPath);
            }

            try (InputStream serviceAccount = Files.newInputStream(path)) {
                return GoogleCredentials.fromStream(serviceAccount);
            }
        }

        ClassPathResource resource = new ClassPathResource("serviceAccountKey.json");
        if (!resource.exists()) {
            throw new IOException(
                    "Firebase credentials not found. Put your local file at src/main/resources/serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS.");
        }

        try (InputStream serviceAccount = resource.getInputStream()) {
            return GoogleCredentials.fromStream(serviceAccount);
        }
    }
}
