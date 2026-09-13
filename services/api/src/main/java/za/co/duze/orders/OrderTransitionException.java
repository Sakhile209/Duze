package za.co.duze.orders;

public final class OrderTransitionException extends RuntimeException {
    public OrderTransitionException(String message) {
        super(message);
    }
}
