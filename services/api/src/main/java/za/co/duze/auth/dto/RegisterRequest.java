package za.co.duze.auth.dto;

public record RegisterRequest(
    String firstName,
    String surname,
    String email,
    String phone,
    String physicalAddress,
    String password,
    String confirmPassword
) {}
