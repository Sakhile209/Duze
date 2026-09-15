ALTER TABLE merchants ADD COLUMN catalogue_category VARCHAR(40) NOT NULL DEFAULT 'Shisanyama'
  CHECK (catalogue_category IN ('Shisanyama', 'Takeaways', 'Stores'));

-- Upgrade legacy state names without changing immutable audit history.
UPDATE orders SET status = CASE status
  WHEN 'ACCEPTED' THEN 'MERCHANT_ACCEPTED' WHEN 'ON_THE_WAY' THEN 'OUT_FOR_DELIVERY' ELSE status END;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'CREATED';
ALTER TABLE orders ADD CONSTRAINT orders_valid_status CHECK (status IN (
  'CREATED','PAYMENT_PENDING','PLACED','MERCHANT_ACCEPTED','PREPARING','RIDER_SEARCHING',
  'RIDER_ASSIGNED','READY_FOR_PICKUP','RIDER_AT_PICKUP','PICKED_UP','OUT_FOR_DELIVERY',
  'DELIVERED','REJECTED','CANCELLED','DELIVERY_FAILED','REFUND_PENDING','REFUNDED'));
ALTER TABLE orders ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN kitchen_ready_at TIMESTAMPTZ;
ALTER TABLE deliveries ADD COLUMN rider_arrived_at TIMESTAMPTZ;

CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  version BIGINT NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  from_status VARCHAR(32),
  to_status VARCHAR(32) NOT NULL,
  actor_user_id UUID REFERENCES users(id),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, version)
);
CREATE INDEX idx_order_events_time ON order_events(order_id, occurred_at);
-- The dispatch feature will add offers/leases, atomic commands and capacity constraints together.
