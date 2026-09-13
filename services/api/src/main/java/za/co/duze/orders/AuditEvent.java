package za.co.duze.orders;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record AuditEvent(
        UUID id,
        UUID orderId,
        ActorRole actorRole,
        OrderStatus fromStatus,
        OrderStatus toStatus,
        String reason,
        Instant occurredAt
) {
    public AuditEvent {
        Objects.requireNonNull(id, "id is required");
        Objects.requireNonNull(orderId, "orderId is required");
        Objects.requireNonNull(actorRole, "actorRole is required");
        Objects.requireNonNull(toStatus, "toStatus is required");
        Objects.requireNonNull(occurredAt, "occurredAt is required");
        if (reason != null && reason.isBlank()) {
            throw new IllegalArgumentException("reason cannot be blank");
        }
    }
}
