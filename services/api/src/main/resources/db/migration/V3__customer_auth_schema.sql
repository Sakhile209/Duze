-- Migration V3: Add customer registration fields, first_name/surname, address details, and indexes

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS surname VARCHAR(80);

-- Backfill first_name and surname from full_name where missing
UPDATE users SET 
    first_name = COALESCE(first_name, split_part(full_name, ' ', 1)),
    surname = COALESCE(surname, CASE 
        WHEN position(' ' in full_name) > 0 THEN substring(full_name from position(' ' in full_name) + 1)
        ELSE full_name
    END)
WHERE first_name IS NULL OR surname IS NULL;

-- Address enhancements for postal code, instructions, and default flag
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) DEFAULT '3276';
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT true;

-- Performance indexes for authentication and lookups
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(lower(email));
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default);
