package za.co.duze.auth.dto;

public record AuthResponse(
    String token,
    String tokenType,
    UserDto user,
    AddressDto defaultAddress
) {
    public AuthResponse(String token, UserDto user, AddressDto defaultAddress) {
        this(token, "Bearer", user, defaultAddress);
    }
}
