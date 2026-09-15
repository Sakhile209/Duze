package za.co.duze.orders;

import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static za.co.duze.orders.OrderStatus.*;
import static za.co.duze.orders.ActorRole.*;

class OrderStateMachineTest {
    private final Instant now = Instant.parse("2026-09-14T10:00:00Z");
    private final OrderStateMachine machine = new OrderStateMachine(Clock.fixed(now, ZoneOffset.UTC));
    private final UUID order = UUID.randomUUID();

    @Test void completeJourneyEmitsTimestampedEvents() {
        OrderStatus[] states = {CREATED, PAYMENT_PENDING, PLACED, MERCHANT_ACCEPTED, PREPARING,
                RIDER_SEARCHING, RIDER_ASSIGNED, READY_FOR_PICKUP, RIDER_AT_PICKUP,
                PICKED_UP, OUT_FOR_DELIVERY, DELIVERED};
        ActorRole[] actors = {SYSTEM, SYSTEM, MERCHANT, MERCHANT, SYSTEM, SYSTEM, MERCHANT, RIDER, RIDER, RIDER, RIDER};
        for (int i = 0; i < actors.length; i++) {
            var event = machine.transition(order, states[i], states[i + 1], actors[i], "verified command");
            assertEquals(order, event.orderId());
            assertEquals(states[i + 1], event.toStatus());
            assertEquals(now, event.occurredAt());
            assertNotNull(event.id());
        }
    }
    @Test void noProviderPaymentCanBePlacedBySystemOnly() {
        machine.transition(order, CREATED, PLACED, SYSTEM, null);
        assertThrows(OrderTransitionException.class, () -> machine.transition(order, CREATED, PLACED, CUSTOMER, null));
    }
    @Test void customersCannotAcceptAssignOrDeliver() {
        for (var pair : new OrderStatus[][] {{PLACED, MERCHANT_ACCEPTED}, {RIDER_SEARCHING, RIDER_ASSIGNED}, {OUT_FOR_DELIVERY, DELIVERED}}) {
            assertThrows(OrderTransitionException.class, () -> machine.transition(order, pair[0], pair[1], CUSTOMER, null));
        }
    }
    @Test void cannotSkipPickupReadinessOrArrival() {
        for (var pair : new OrderStatus[][] {{PLACED, PICKED_UP}, {RIDER_ASSIGNED, PICKED_UP}, {READY_FOR_PICKUP, PICKED_UP}}) {
            assertThrows(OrderTransitionException.class, () -> machine.transition(order, pair[0], pair[1], RIDER, null));
        }
    }
    @Test void customersCancelOnlyBeforeAcceptance() {
        assertTrue(machine.canCancel(PLACED, CUSTOMER));
        assertFalse(machine.canCancel(MERCHANT_ACCEPTED, CUSTOMER));
        assertThrows(OrderTransitionException.class, () -> machine.transition(order, PREPARING, CANCELLED, CUSTOMER, "Changed mind"));
    }
    @Test void adminCannotCancelAfterPickup() {
        assertFalse(machine.canCancel(PICKED_UP, ADMIN));
        machine.transition(order, PICKED_UP, DELIVERY_FAILED, ADMIN, "Incident");
    }
    @Test void exceptionsNeedReasonsAndRefundNeedsSystemConfirmation() {
        assertThrows(OrderTransitionException.class, () -> machine.transition(order, PLACED, REJECTED, MERCHANT, " "));
        machine.transition(order, PLACED, REJECTED, MERCHANT, "Kitchen closed");
        machine.transition(order, REJECTED, REFUND_PENDING, SYSTEM, "Captured payment");
        assertThrows(OrderTransitionException.class, () -> machine.transition(order, REFUND_PENDING, REFUNDED, ADMIN, "Unverified"));
        machine.transition(order, REFUND_PENDING, REFUNDED, SYSTEM, "Provider verified");
    }
    @Test void refundedIsTerminalAndSelfTransitionsAreRejected() {
        for (var state : OrderStatus.values()) {
            assertFalse(machine.canTransition(REFUNDED, state));
            assertFalse(machine.canTransition(state, state));
        }
    }
}
