-- Add UUID support to all tables for future migration
-- This migration adds UUID columns while maintaining backward compatibility

-- Enable UUID extension if not already enabled
-- Note: This might fail if extension already exists, but that's OK
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Extension already exists, that's fine
END $$;

-- Add UUID columns to all tables with integer IDs
-- Safely add columns that might already exist from previous migration attempts

-- Users table
DO $$
BEGIN
    ALTER TABLE users ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Stream sources table
DO $$
BEGIN
    ALTER TABLE stream_sources ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Active streams table
DO $$
BEGIN
    ALTER TABLE active_streams ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Source destinations table
DO $$
BEGIN
    ALTER TABLE source_destinations ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Subscription plans table
DO $$
BEGIN
    ALTER TABLE subscription_plans ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- User subscriptions table
DO $$
BEGIN
    ALTER TABLE user_subscriptions ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Usage tracking table
DO $$
BEGIN
    ALTER TABLE usage_tracking ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Plan limits tracking table
DO $$
BEGIN
    ALTER TABLE plan_limits_tracking ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Payment orders table
DO $$
BEGIN
    ALTER TABLE payment_orders ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Payments table
DO $$
BEGIN
    ALTER TABLE payments ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Chat connectors table
DO $$
BEGIN
    ALTER TABLE chat_connectors ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Chat messages table
DO $$
BEGIN
    ALTER TABLE chat_messages ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Chat sessions table
DO $$
BEGIN
    ALTER TABLE chat_sessions ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Admin settings table
DO $$
BEGIN
    ALTER TABLE admin_settings ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Create indexes for UUID columns for better performance (only if they don't exist)
DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_users_uuid ON users(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_stream_sources_uuid ON stream_sources(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_active_streams_uuid ON active_streams(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_source_destinations_uuid ON source_destinations(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_subscription_plans_uuid ON subscription_plans(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_user_subscriptions_uuid ON user_subscriptions(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_usage_tracking_uuid ON usage_tracking(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_plan_limits_tracking_uuid ON plan_limits_tracking(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_payment_orders_uuid ON payment_orders(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_payments_uuid ON payments(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_chat_connectors_uuid ON chat_connectors(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_chat_messages_uuid ON chat_messages(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_chat_sessions_uuid ON chat_sessions(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

DO $$
BEGIN
    CREATE INDEX CONCURRENTLY idx_admin_settings_uuid ON admin_settings(uuid);
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Index already exists, that's fine
END $$;

-- Note: We're not changing foreign key relationships yet to maintain backward compatibility
-- Future migrations can update foreign keys to reference UUIDs when ready