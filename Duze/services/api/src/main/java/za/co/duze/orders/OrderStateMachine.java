package za.co.duze.orders;

import java.time.Clock;
import java.util.*;
import static za.co.duze.orders.OrderStatus.*;
import static za.co.duze.orders.ActorRole.*;

/** Graph/role validation only. Transactional command services must enforce ownership and business prerequisites. */
public final class OrderStateMachine {
    private record Edge(OrderStatus from, OrderStatus to) {}
    private static final Map<Edge, Set<ActorRole>> RULES = new HashMap<>();
    static {
        allow(CREATED, PAYMENT_PENDING, SYSTEM);
        allow(CREATED, PLACED, SYSTEM);
        allow(PAYMENT_PENDING, PLACED, SYSTEM);
        allow(PLACED, MERCHANT_ACCEPTED, MERCHANT);
        allow(PLACED, REJECTED, MERCHANT);
        allow(MERCHANT_ACCEPTED, PREPARING, MERCHANT);
        allow(PREPARING, RIDER_SEARCHING, SYSTEM);
        allow(RIDER_SEARCHING, RIDER_ASSIGNED, SYSTEM, ADMIN);
        allow(RIDER_ASSIGNED, READY_FOR_PICKUP, MERCHANT, SYSTEM);
        allow(READY_FOR_PICKUP, RIDER_AT_PICKUP, RIDER, SYSTEM);
        allow(RIDER_AT_PICKUP, PICKED_UP, RIDER);
        allow(PICKED_UP, OUT_FOR_DELIVERY, RIDER);
        allow(OUT_FOR_DELIVERY, DELIVERED, RIDER);
        for (var state : EnumSet.of(CREATED, PAYMENT_PENDING, PLACED)) {
            allow(state, CANCELLED, CUSTOMER, ADMIN, SYSTEM);
        }
        for (var state : EnumSet.of(MERCHANT_ACCEPTED, PREPARING, RIDER_SEARCHING,
                RIDER_ASSIGNED, READY_FOR_PICKUP, RIDER_AT_PICKUP)) {
            allow(state, CANCELLED, ADMIN);
        }
        allow(PICKED_UP, DELIVERY_FAILED, RIDER, ADMIN);
        allow(OUT_FOR_DELIVERY, DELIVERY_FAILED, RIDER, ADMIN);
        for (var state : EnumSet.of(REJECTED, CANCELLED, DELIVERY_FAILED, DELIVERED)) {
            allow(state, REFUND_PENDING, ADMIN, SYSTEM);
        }
        allow(REFUND_PENDING, REFUNDED, SYSTEM);
    }
    private static void allow(OrderStatus from, OrderStatus to, ActorRole... roles) {
        RULES.put(new Edge(from, to), Set.of(roles));
    }
    private final Clock clock;
    public OrderStateMachine(Clock clock) { this.clock = Objects.requireNonNull(clock); }

    public AuditEvent transition(UUID orderId, OrderStatus from, OrderStatus to, ActorRole actor, String reason) {
        Objects.requireNonNull(orderId);
        Objects.requireNonNull(from);
        Objects.requireNonNull(to);
        Objects.requireNonNull(actor);
        if (!canTransition(from, to)) throw new OrderTransitionException("Cannot transition order from " + from + " to " + to);
        if (!RULES.get(new Edge(from, to)).contains(actor)) {
            throw new OrderTransitionException(actor + " cannot transition " + from + " to " + to);
        }
        if (Set.of(REJECTED, CANCELLED, DELIVERY_FAILED, REFUND_PENDING).contains(to)
                && (reason == null || reason.isBlank())) {
            throw new OrderTransitionException("A reason is required for " + to);
        }
        return new AuditEvent(UUID.randomUUID(), orderId, actor, from, to, reason, clock.instant());
    }
    public boolean canTransition(OrderStatus from, OrderStatus to) { return RULES.containsKey(new Edge(from, to)); }
    public boolean canCancel(OrderStatus from, ActorRole actor) {
        return RULES.getOrDefault(new Edge(from, CANCELLED), Set.of()).contains(actor);
    }
}
