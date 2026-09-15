package za.co.duze.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
    UUID id,
    String firstName,
    String surname,
    String fullName,
    String email,
    String phone,
    String role,
    String status,
    Instant createdAt
) {}
