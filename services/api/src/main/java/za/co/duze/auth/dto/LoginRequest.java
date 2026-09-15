package za.co.duze.auth.dto;

public record LoginRequest(
    String emailOrPhone,
    String password
) {}
