package za.co.duze.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import za.co.duze.auth.dto.*;

import static org.junit.jupiter.api.Assertions.*;

public class AuthServiceTest {
    private PasswordService passwordService;

    @BeforeEach
    void setUp() {
        passwordService = new PasswordService();
    }

    @Test
    void passwordHashingAndVerificationWorks() {
        String rawPassword = "SecretPassword123";
        String hash = passwordService.hashPassword(rawPassword);

        assertNotNull(hash);
        assertNotEquals(rawPassword, hash);
        assertTrue(passwordService.verifyPassword(rawPassword, hash));
        assertFalse(passwordService.verifyPassword("WrongPassword", hash));
    }

    @Test
    void passwordShorterThanEightCharsFails() {
        assertThrows(IllegalArgumentException.class, () -> passwordService.hashPassword("short"));
    }

    @Test
    void registerRequestValidationRules() {
        AuthService service = new AuthService(null, passwordService, new JwtTokenProvider());

        // Missing first name
        assertThrows(ResponseStatusException.class, () ->
            service.register(new RegisterRequest("", "Simelane", "sakhile@example.com", "0712345678", "Ixopo", "Secret123", "Secret123"))
        );

        // Missing surname
        assertThrows(ResponseStatusException.class, () ->
            service.register(new RegisterRequest("Sakhile", "", "sakhile@example.com", "0712345678", "Ixopo", "Secret123", "Secret123"))
        );

        // Invalid email
        assertThrows(ResponseStatusException.class, () ->
            service.register(new RegisterRequest("Sakhile", "Simelane", "notanemail", "0712345678", "Ixopo", "Secret123", "Secret123"))
        );

        // Invalid phone
        assertThrows(ResponseStatusException.class, () ->
            service.register(new RegisterRequest("Sakhile", "Simelane", "sakhile@example.com", "123", "Ixopo", "Secret123", "Secret123"))
        );

        // Missing physical address
        assertThrows(ResponseStatusException.class, () ->
            service.register(new RegisterRequest("Sakhile", "Simelane", "sakhile@example.com", "0712345678", "", "Secret123", "Secret123"))
        );

        // Password mismatch
        assertThrows(ResponseStatusException.class, () ->
            service.register(new RegisterRequest("Sakhile", "Simelane", "sakhile@example.com", "0712345678", "Ixopo", "Secret123", "Different123"))
        );

        // Short password
        assertThrows(ResponseStatusException.class, () ->
            service.register(new RegisterRequest("Sakhile", "Simelane", "sakhile@example.com", "0712345678", "Ixopo", "short", "short"))
        );
    }
}
