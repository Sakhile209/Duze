package za.co.duze.auth;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import za.co.duze.auth.dto.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh() {
        return ResponseEntity.ok(Map.of("message", "Token refresh endpoint active"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.emailOrPhone() == null || request.emailOrPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone number is required");
        }
        return ResponseEntity.ok(Map.of("message", "If an account exists with this email/phone, password reset instructions have been sent."));
    }
}
