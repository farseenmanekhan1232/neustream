-- Migration: Add UUID foreign key columns for backward-compatible UUID support
-- This migration adds UUID foreign key columns alongside existing integer foreign keys
-- to maintain backward compatibility while enabling UUID-based API endpoints

-- Add user_uuid column to stream_sources (references users.uuid)
DO $$
BEGIN
    ALTER TABLE stream_sources ADD COLUMN user_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for user_uuid
DO $$
BEGIN
    ALTER TABLE stream_sources ADD CONSTRAINT stream_sources_user_uuid_fkey
        FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add user_uuid column to destinations (references users.uuid)
DO $$
BEGIN
    ALTER TABLE destinations ADD COLUMN user_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for user_uuid
DO $$
BEGIN
    ALTER TABLE destinations ADD CONSTRAINT destinations_user_uuid_fkey
        FOREIGN KEY (user_uuid) REFERENCES users(uuid);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add user_uuid column to user_subscriptions (references users.uuid)
DO $$
BEGIN
    ALTER TABLE user_subscriptions ADD COLUMN user_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for user_uuid
DO $$
BEGIN
    ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_uuid_fkey
        FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add user_uuid column to payment_orders (references users.uuid)
DO $$
BEGIN
    ALTER TABLE payment_orders ADD COLUMN user_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for user_uuid
DO $$
BEGIN
    ALTER TABLE payment_orders ADD CONSTRAINT payment_orders_user_uuid_fkey
        FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add user_uuid column to payments (references users.uuid)
DO $$
BEGIN
    ALTER TABLE payments ADD COLUMN user_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for user_uuid
DO $$
BEGIN
    ALTER TABLE payments ADD CONSTRAINT payments_user_uuid_fkey
        FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add source_uuid column to source_destinations (references stream_sources.uuid)
DO $$
BEGIN
    ALTER TABLE source_destinations ADD COLUMN source_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for source_uuid
DO $$
BEGIN
    ALTER TABLE source_destinations ADD CONSTRAINT source_destinations_source_uuid_fkey
        FOREIGN KEY (source_uuid) REFERENCES stream_sources(uuid) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add plan_uuid column to user_subscriptions (references subscription_plans.uuid)
DO $$
BEGIN
    ALTER TABLE user_subscriptions ADD COLUMN plan_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for plan_uuid
DO $$
BEGIN
    ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_plan_uuid_fkey
        FOREIGN KEY (plan_uuid) REFERENCES subscription_plans(uuid);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add plan_uuid column to payment_orders (references subscription_plans.uuid)
DO $$
BEGIN
    ALTER TABLE payment_orders ADD COLUMN plan_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for plan_uuid
DO $$
BEGIN
    ALTER TABLE payment_orders ADD CONSTRAINT payment_orders_plan_uuid_fkey
        FOREIGN KEY (plan_uuid) REFERENCES subscription_plans(uuid);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add plan_uuid column to payments (references subscription_plans.uuid)
DO $$
BEGIN
    ALTER TABLE payments ADD COLUMN plan_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for plan_uuid
DO $$
BEGIN
    ALTER TABLE payments ADD CONSTRAINT payments_plan_uuid_fkey
        FOREIGN KEY (plan_uuid) REFERENCES subscription_plans(uuid);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add connector_uuid column to chat_messages (references chat_connectors.uuid)
DO $$
BEGIN
    ALTER TABLE chat_messages ADD COLUMN connector_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for connector_uuid
DO $$
BEGIN
    ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_connector_uuid_fkey
        FOREIGN KEY (connector_uuid) REFERENCES chat_connectors(uuid);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Update existing data to populate UUID foreign keys
-- This will populate the UUID foreign key columns based on existing integer foreign keys
UPDATE stream_sources ss SET user_uuid = u.uuid FROM users u WHERE ss.user_id = u.id;
UPDATE destinations d SET user_uuid = u.uuid FROM users u WHERE d.user_id = u.id;
UPDATE user_subscriptions us SET user_uuid = u.uuid, plan_uuid = sp.uuid FROM users u, subscription_plans sp WHERE us.user_id = u.id AND us.plan_id = sp.id;
UPDATE payment_orders po SET user_uuid = u.uuid, plan_uuid = sp.uuid FROM users u, subscription_plans sp WHERE po.user_id = u.id AND po.plan_id = sp.id;
UPDATE payments p SET user_uuid = u.uuid, plan_uuid = sp.uuid FROM users u, subscription_plans sp WHERE p.user_id = u.id AND p.plan_id = sp.id;
UPDATE source_destinations sd SET source_uuid = ss.uuid FROM stream_sources ss WHERE sd.source_id = ss.id;
UPDATE chat_messages cm SET connector_uuid = cc.uuid FROM chat_connectors cc WHERE cm.connector_id = cc.id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stream_sources_user_uuid ON stream_sources(user_uuid);
CREATE INDEX IF NOT EXISTS idx_destinations_user_uuid ON destinations(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_uuid ON user_subscriptions(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_uuid ON user_subscriptions(plan_uuid);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_uuid ON payment_orders(user_uuid);
CREATE INDEX IF NOT EXISTS idx_payment_orders_plan_uuid ON payment_orders(plan_uuid);
CREATE INDEX IF NOT EXISTS idx_payments_user_uuid ON payments(user_uuid);
CREATE INDEX IF NOT EXISTS idx_payments_plan_uuid ON payments(plan_uuid);
CREATE INDEX IF NOT EXISTS idx_source_destinations_source_uuid ON source_destinations(source_uuid);
CREATE INDEX IF NOT EXISTS idx_chat_messages_connector_uuid ON chat_messages(connector_uuid);