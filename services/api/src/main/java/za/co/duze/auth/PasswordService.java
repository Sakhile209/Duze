package za.co.duze.auth;

import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class PasswordService {
    private static final int SALT_LENGTH = 16;
    private static final int ITERATIONS = 10000;

    public String hashPassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        try {
            byte[] salt = new byte[SALT_LENGTH];
            new SecureRandom().nextBytes(salt);
            byte[] hash = pbkdf2(password.toCharArray(), salt, ITERATIONS, 256);
            return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public boolean verifyPassword(String password, String storedHash) {
        if (password == null || storedHash == null || !storedHash.contains(":")) {
            return false;
        }
        try {
            String[] parts = storedHash.split(":");
            byte[] salt = Base64.getDecoder().decode(parts[0]);
            byte[] hash = Base64.getDecoder().decode(parts[1]);
            byte[] testHash = pbkdf2(password.toCharArray(), salt, ITERATIONS, 256);
            return MessageDigest.isEqual(hash, testHash);
        } catch (Exception e) {
            return false;
        }
    }

    private byte[] pbkdf2(char[] password, byte[] salt, int iterations, int keyLengthBits) throws NoSuchAlgorithmException {
        try {
            javax.crypto.SecretKeyFactory skf = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            javax.crypto.spec.PBEKeySpec spec = new javax.crypto.spec.PBEKeySpec(password, salt, iterations, keyLengthBits);
            return skf.generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
