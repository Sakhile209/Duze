package za.co.duze.orders;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

public final class OrderStateMachineTest {
    public static void main(String[] args) {
        var test = new OrderStateMachineTest();
        test.allowsValidOrderJourneyTransition();
        test.rejectsImpossibleTransition();
        test.blocksCustomerCancellationAfterPreparation();
        test.allowsAdminCancellationBeforeDelivery();
    }

    void allowsValidOrderJourneyTransition() {
        var machine = fixedMachine();
        var orderId = UUID.randomUUID();

        var event = machine.transition(orderId, OrderStatus.PLACED, OrderStatus.ACCEPTED, ActorRole.MERCHANT, "Accepted by kitchen");

        assertEquals(orderId, event.orderId(), "audit event order id");
        assertEquals(OrderStatus.PLACED, event.fromStatus(), "audit event from status");
        assertEquals(OrderStatus.ACCEPTED, event.toStatus(), "audit event to status");
        assertEquals(ActorRole.MERCHANT, event.actorRole(), "audit actor");
        assertEquals(Instant.parse("2026-09-11T10:00:00Z"), event.occurredAt(), "audit timestamp");
    }

    void rejectsImpossibleTransition() {
        var machine = fixedMachine();

        assertThrows(() -> machine.transition(
                UUID.randomUUID(),
                OrderStatus.PLACED,
                OrderStatus.PICKED_UP,
                ActorRole.RIDER,
                "Cannot skip merchant workflow"
        ), "Cannot transition order from PLACED to PICKED_UP");
    }

    void blocksCustomerCancellationAfterPreparation() {
        var machine = fixedMachine();

        assertThrows(() -> machine.transition(
                UUID.randomUUID(),
                OrderStatus.PREPARING,
                OrderStatus.CANCELLED,
                ActorRole.CUSTOMER,
                "Customer changed mind"
        ), "CUSTOMER cannot cancel an order from PREPARING");
    }

    void allowsAdminCancellationBeforeDelivery() {
        var machine = fixedMachine();

        var event = machine.transition(
                UUID.randomUUID(),
                OrderStatus.ON_THE_WAY,
                OrderStatus.CANCELLED,
                ActorRole.ADMIN,
                "Customer unreachable"
        );

        assertEquals(OrderStatus.CANCELLED, event.toStatus(), "admin cancellation status");
    }

    private OrderStateMachine fixedMachine() {
        return new OrderStateMachine(Clock.fixed(Instant.parse("2026-09-11T10:00:00Z"), ZoneOffset.UTC));
    }

    private static void assertThrows(Runnable action, String expectedMessage) {
        try {
            action.run();
            throw new AssertionError("Expected exception with message: " + expectedMessage);
        } catch (OrderTransitionException exception) {
            assertEquals(expectedMessage, exception.getMessage(), "exception message");
        }
    }

    private static void assertEquals(Object expected, Object actual, String label) {
        if (!expected.equals(actual)) {
            throw new AssertionError(label + " expected <" + expected + "> but was <" + actual + ">");
        }
    }
}
