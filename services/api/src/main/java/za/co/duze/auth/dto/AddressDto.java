package za.co.duze.auth.dto;

import java.util.UUID;

public record AddressDto(
    UUID id,
    UUID userId,
    String label,
    String line1,
    String line2,
    String suburb,
    String town,
    String province,
    String postalCode,
    double latitude,
    double longitude,
    String deliveryInstructions,
    boolean isDefault
) {}
