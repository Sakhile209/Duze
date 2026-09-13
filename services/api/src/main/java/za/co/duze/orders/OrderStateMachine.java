package za.co.duze.orders;

import java.time.Clock;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public final class OrderStateMachine {
    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        TRANSITIONS.put(OrderStatus.PLACED, EnumSet.of(OrderStatus.ACCEPTED, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.ACCEPTED, EnumSet.of(OrderStatus.PREPARING, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.PREPARING, EnumSet.of(OrderStatus.RIDER_ASSIGNED, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.RIDER_ASSIGNED, EnumSet.of(OrderStatus.PICKED_UP, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.PICKED_UP, EnumSet.of(OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.ON_THE_WAY, EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.DELIVERED, EnumSet.of(OrderStatus.REFUND_PENDING));
        TRANSITIONS.put(OrderStatus.REFUND_PENDING, EnumSet.of(OrderStatus.REFUNDED));
        TRANSITIONS.put(OrderStatus.CANCELLED, EnumSet.of(OrderStatus.REFUND_PENDING));
        TRANSITIONS.put(OrderStatus.REFUNDED, EnumSet.noneOf(OrderStatus.class));
    }

    private final Clock clock;

    public OrderStateMachine(Clock clock) {
        this.clock = Objects.requireNonNull(clock, "clock is required");
    }

    public AuditEvent transition(
            UUID orderId,
            OrderStatus fromStatus,
            OrderStatus toStatus,
            ActorRole actorRole,
            String reason
    ) {
        Objects.requireNonNull(orderId, "orderId is required");
        Objects.requireNonNull(fromStatus, "fromStatus is required");
        Objects.requireNonNull(toStatus, "toStatus is required");
        Objects.requireNonNull(actorRole, "actorRole is required");

        if (!canTransition(fromStatus, toStatus)) {
            throw new OrderTransitionException("Cannot transition order from " + fromStatus + " to " + toStatus);
        }

        if (toStatus == OrderStatus.CANCELLED && !canCancel(fromStatus, actorRole)) {
            throw new OrderTransitionException(actorRole + " cannot cancel an order from " + fromStatus);
        }

        return new AuditEvent(
                UUID.randomUUID(),
                orderId,
                actorRole,
                fromStatus,
                toStatus,
                reason,
                clock.instant()
        );
    }

    public boolean canTransition(OrderStatus fromStatus, OrderStatus toStatus) {
        return TRANSITIONS.getOrDefault(fromStatus, Set.of()).contains(toStatus);
    }

    public boolean canCancel(OrderStatus fromStatus, ActorRole actorRole) {
        return switch (actorRole) {
            case CUSTOMER -> fromStatus == OrderStatus.PLACED || fromStatus == OrderStatus.ACCEPTED;
            case MERCHANT -> fromStatus == OrderStatus.PLACED
                    || fromStatus == OrderStatus.ACCEPTED
                    || fromStatus == OrderStatus.PREPARING;
            case RIDER -> false;
            case ADMIN, SYSTEM -> fromStatus != OrderStatus.DELIVERED
                    && fromStatus != OrderStatus.REFUND_PENDING
                    && fromStatus != OrderStatus.REFUNDED
                    && fromStatus != OrderStatus.CANCELLED;
        };
    }
}
