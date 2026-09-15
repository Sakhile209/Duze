package za.co.duze.auth.dto;

public record ForgotPasswordRequest(
    String emailOrPhone
) {}
