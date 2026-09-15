package za.co.duze.auth;

import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import za.co.duze.auth.dto.*;

@Service
public class AuthService {
    private final JdbcClient jdbc;
    private final PasswordService passwordService;
    private final JwtTokenProvider tokenProvider;

    public AuthService(JdbcClient jdbc, PasswordService passwordService, JwtTokenProvider tokenProvider) {
        this.jdbc = jdbc;
        this.passwordService = passwordService;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        // 1. Validation
        if (req.firstName() == null || req.firstName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "First name is required");
        }
        if (req.surname() == null || req.surname().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Surname is required");
        }
        if (req.email() == null || !req.email().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid email address is required");
        }
        if (req.phone() == null || req.phone().replaceAll("\\s+", "").length() < 9) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid phone number is required");
        }
        if (req.physicalAddress() == null || req.physicalAddress().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Physical address is required");
        }
        if (req.password() == null || req.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
        }
        if (!req.password().equals(req.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password and Confirm Password do not match");
        }

        String normalizedEmail = req.email().trim().toLowerCase();
        String normalizedPhone = req.phone().replaceAll("\\s+", "").trim();

        // 2. Unique email & phone check
        Integer existingEmail = jdbc.sql("SELECT count(*) FROM users WHERE lower(email) = :email")
                .param("email", normalizedEmail).query(Integer.class).single();
        if (existingEmail > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email address already exists");
        }

        Integer existingPhone = jdbc.sql("SELECT count(*) FROM users WHERE phone = :phone")
                .param("phone", normalizedPhone).query(Integer.class).single();
        if (existingPhone > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this phone number already exists");
        }

        // 3. Password Hashing & Strict CUSTOMER Role
        String passwordHash = passwordService.hashPassword(req.password());
        UUID userId = UUID.randomUUID();
        String fullName = req.firstName().trim() + " " + req.surname().trim();
        Instant now = Instant.now();

        jdbc.sql("""
            INSERT INTO users (id, first_name, surname, full_name, email, phone, password_hash, role, status, created_at, updated_at)
            VALUES (:id, :firstName, :surname, :fullName, :email, :phone, :passwordHash, 'CUSTOMER', 'ACTIVE', :createdAt, :updatedAt)
            """)
                .param("id", userId)
                .param("firstName", req.firstName().trim())
                .param("surname", req.surname().trim())
                .param("fullName", fullName)
                .param("email", normalizedEmail)
                .param("phone", normalizedPhone)
                .param("passwordHash", passwordHash)
                .param("createdAt", now)
                .param("updatedAt", now)
                .update();

        // 4. Create Default Address
        UUID addressId = UUID.randomUUID();
        jdbc.sql("""
            INSERT INTO addresses (id, user_id, label, line1, town, province, postal_code, latitude, longitude, is_default, created_at, updated_at)
            VALUES (:id, :userId, 'Home', :line1, 'eXobho', 'KwaZulu-Natal', '3276', -30.1530000, 30.0740000, true, :createdAt, :updatedAt)
            """)
                .param("id", addressId)
                .param("userId", userId)
                .param("line1", req.physicalAddress().trim())
                .param("createdAt", now)
                .param("updatedAt", now)
                .update();

        // 5. Create Customer Profile with Default Address
        UUID profileId = UUID.randomUUID();
        jdbc.sql("""
            INSERT INTO customer_profiles (id, user_id, default_address_id, created_at, updated_at)
            VALUES (:id, :userId, :addressId, :createdAt, :updatedAt)
            """)
                .param("id", profileId)
                .param("userId", userId)
                .param("addressId", addressId)
                .param("createdAt", now)
                .param("updatedAt", now)
                .update();

        // 6. Generate token & response
        String token = tokenProvider.generateToken(userId, normalizedEmail, "CUSTOMER");
        UserDto userDto = new UserDto(userId, req.firstName().trim(), req.surname().trim(), fullName, normalizedEmail, normalizedPhone, "CUSTOMER", "ACTIVE", now);
        AddressDto addressDto = new AddressDto(addressId, userId, "Home", req.physicalAddress().trim(), null, null, "eXobho", "KwaZulu-Natal", "3276", -30.1530000, 30.0740000, null, true);

        return new AuthResponse(token, userDto, addressDto);
    }

    public AuthResponse login(LoginRequest req) {
        if (req.emailOrPhone() == null || req.emailOrPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone number is required");
        }
        if (req.password() == null || req.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        String identifier = req.emailOrPhone().trim();
        String normalizedEmail = identifier.toLowerCase();
        String normalizedPhone = identifier.replaceAll("\\s+", "");

        var userRow = jdbc.sql("""
            SELECT id, first_name, surname, full_name, email, phone, password_hash, role, status, created_at
            FROM users WHERE lower(email) = :email OR phone = :phone OR phone = :identifier
            """)
                .param("email", normalizedEmail)
                .param("phone", normalizedPhone)
                .param("identifier", identifier)
                .query((rs, rowNum) -> new Object[] {
                        UUID.fromString(rs.getString("id")),
                        rs.getString("first_name"),
                        rs.getString("surname"),
                        rs.getString("full_name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("password_hash"),
                        rs.getString("role"),
                        rs.getString("status"),
                        rs.getTimestamp("created_at").toInstant()
                }).optional();

        if (userRow.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Object[] u = userRow.get();
        String storedHash = (String) u[6];
        if (!passwordService.verifyPassword(req.password(), storedHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        UUID userId = (UUID) u[0];
        String firstName = (String) u[1];
        String surname = (String) u[2];
        String fullName = (String) u[3];
        String email = (String) u[4];
        String phone = (String) u[5];
        String role = (String) u[7];
        String status = (String) u[8];
        Instant createdAt = (Instant) u[9];

        // Fetch default address
        var addressRow = jdbc.sql("""
            SELECT id, user_id, label, line1, line2, suburb, town, province, postal_code, latitude, longitude, delivery_instructions, is_default
            FROM addresses WHERE user_id = :userId AND is_default = true LIMIT 1
            """)
                .param("userId", userId)
                .query((rs, rowNum) -> new AddressDto(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("user_id")),
                        rs.getString("label"),
                        rs.getString("line1"),
                        rs.getString("line2"),
                        rs.getString("suburb"),
                        rs.getString("town"),
                        rs.getString("province"),
                        rs.getString("postal_code"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude"),
                        rs.getString("delivery_instructions"),
                        rs.getBoolean("is_default")
                )).optional().orElse(null);

        String token = tokenProvider.generateToken(userId, email, role);
        UserDto userDto = new UserDto(userId, firstName, surname, fullName, email, phone, role, status, createdAt);

        return new AuthResponse(token, userDto, addressRow);
    }
}
