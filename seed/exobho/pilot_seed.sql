-- DEVELOPMENT ONLY: fictional merchants, credentials, fees and service zone. Never load in production.
INSERT INTO delivery_zones (
    id,
    name,
    center_latitude,
    center_longitude,
    radius_km,
    base_fee_cents,
    per_km_fee_cents,
    service_fee_cents,
    minimum_order_cents,
    merchant_commission_bps
) VALUES (
    '00000000-0000-0000-0000-000000000101',
    'eXobho Central Pilot',
    -30.1516000,
    30.0714000,
    7.50,
    1500,
    450,
    350,
    5000,
    1200
);

INSERT INTO users (id, email, phone, password_hash, full_name, role, status) VALUES
    ('00000000-0000-0000-0000-000000000201', 'admin@duze.local', '+27000000001', 'replace-with-hash', 'Duze Admin', 'ADMIN', 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000202', 'merchant@duze.local', '+27000000002', 'replace-with-hash', 'Demo Kitchen Owner', 'MERCHANT', 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000203', 'rider@duze.local', '+27000000003', 'replace-with-hash', 'Pilot Rider', 'RIDER', 'ACTIVE'),
    ('00000000-0000-0000-0000-000000000204', 'customer@duze.local', '+27000000004', 'replace-with-hash', 'Pilot Customer', 'CUSTOMER', 'ACTIVE');

INSERT INTO customer_profiles (id, user_id) VALUES
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000204');

INSERT INTO addresses (
    id,
    user_id,
    label,
    line1,
    town,
    province,
    latitude,
    longitude
) VALUES (
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000204',
    'Home',
    'Central eXobho',
    'eXobho',
    'KwaZulu-Natal',
    -30.1530000,
    30.0740000
);

UPDATE customer_profiles
SET default_address_id = '00000000-0000-0000-0000-000000000401'
WHERE id = '00000000-0000-0000-0000-000000000301';

INSERT INTO merchants (
    id,
    owner_user_id,
    delivery_zone_id,
    name,
    description,
    status,
    service_status,
    street_address,
    latitude,
    longitude,
    estimated_prep_minutes
) VALUES (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000101',
    'Ember & Pap',
    'Local grill plates, wings and sides prepared in central eXobho.',
    'APPROVED',
    'OPEN',
    'Main Road, eXobho',
    -30.1505000,
    30.0725000,
    30
);

INSERT INTO categories (id, merchant_id, name, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000501', 'Grill Plates', 1),
    ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000501', 'Sides', 2);

INSERT INTO menu_items (id, merchant_id, category_id, name, description, price_cents, is_available) VALUES
    ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000601', 'Mixed Grill Plate', 'Beef, wors, chicken, pap and chakalaka.', 9500, true),
    ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000601', 'Wings Combo', 'Grilled wings with chips and sauce.', 7800, true),
    ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000602', 'Pap and Chakalaka', 'Classic side portion.', 2500, true);

INSERT INTO riders (id, user_id, status, availability, vehicle_type) VALUES
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000203', 'APPROVED', 'OFFLINE', 'MOTORCYCLE');

INSERT INTO merchants (id, owner_user_id, delivery_zone_id, name, description, status, service_status, street_address, latitude, longitude, estimated_prep_minutes, catalogue_category) VALUES ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'The Lunchbox', 'Comfort food for your lunch break.', 'APPROVED', 'OPEN', 'Demo address, eXobho', -30.1516, 30.0714, 20, 'Takeaways');
INSERT INTO categories(id, merchant_id, name) VALUES ('00000000-0000-0000-0000-000000000612', '00000000-0000-0000-0000-000000000502', 'Favourites');
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000740', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000612', 'Chicken burger', 'Grilled chicken, slaw and house sauce.', 6500);
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000741', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000612', 'Loaded chips', 'Golden chips with cheese and relish.', 4500);

INSERT INTO merchants (id, owner_user_id, delivery_zone_id, name, description, status, service_status, street_address, latitude, longitude, estimated_prep_minutes, catalogue_category) VALUES ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Hillside Kitchen', 'Flame-grilled favourites and generous sides.', 'APPROVED', 'OPEN', 'Demo address, eXobho', -30.1516, 30.0714, 30, 'Shisanyama');
INSERT INTO categories(id, merchant_id, name) VALUES ('00000000-0000-0000-0000-000000000613', '00000000-0000-0000-0000-000000000503', 'Favourites');
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000750', '00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000613', 'Wors and pap', 'Boerewors, pap and chakalaka.', 7000);
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000751', '00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000613', 'Family grill', 'A generous mixed grill to share.', 19500);

INSERT INTO merchants (id, owner_user_id, delivery_zone_id, name, description, status, service_status, street_address, latitude, longitude, estimated_prep_minutes, catalogue_category) VALUES ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Corner Pantry', 'Everyday essentials from around the corner.', 'APPROVED', 'CLOSED', 'Demo address, eXobho', -30.1516, 30.0714, 15, 'Stores');
INSERT INTO categories(id, merchant_id, name) VALUES ('00000000-0000-0000-0000-000000000614', '00000000-0000-0000-0000-000000000504', 'Favourites');
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000760', '00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000614', 'Fresh bread', 'One everyday loaf.', 1800);
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000761', '00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000614', 'Milk 2L', 'Fresh full-cream milk.', 3500);

INSERT INTO merchants (id, owner_user_id, delivery_zone_id, name, description, status, service_status, street_address, latitude, longitude, estimated_prep_minutes, catalogue_category) VALUES ('00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Golden Crust', 'Freshly baked bites and something sweet.', 'APPROVED', 'OPEN', 'Demo address, eXobho', -30.1516, 30.0714, 20, 'Takeaways');
INSERT INTO categories(id, merchant_id, name) VALUES ('00000000-0000-0000-0000-000000000615', '00000000-0000-0000-0000-000000000505', 'Favourites');
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000770', '00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000615', 'Savoury pie', 'Freshly baked chicken pie.', 3000);
INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents) VALUES ('00000000-0000-0000-0000-000000000771', '00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000615', 'Cinnamon bun', 'Soft dough with cinnamon sugar.', 2500);

INSERT INTO menu_items(id, merchant_id, category_id, name, description, price_cents, is_available) VALUES ('00000000-0000-0000-0000-000000000799', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000601', 'Sunday special', 'Slow-cooked special, back soon.', 11000, false);
