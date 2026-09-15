package za.co.duze.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    private static final String SECRET = "DuzeDeliveryPlatformeXobhoKwaZuluNatalSecretKey2026";
    private static final long EXPIRATION_SECONDS = 86400 * 7; // 7 days

    public String generateToken(UUID userId, String email, String role) {
        long now = Instant.now().getEpochSecond();
        long exp = now + EXPIRATION_SECONDS;
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payloadJson = String.format("{\"sub\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                userId, email != null ? email : "", role, now, exp);
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    public boolean validateToken(String token) {
        if (token == null || !token.contains(".")) return false;
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;
        String expectedSignature = sign(parts[0] + "." + parts[1]);
        return expectedSignature.equals(parts[2]);
    }

    private String sign(String data) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error signing JWT", e);
        }
    }
}
