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
-- Users table
ALTER TABLE users ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Stream sources table
ALTER TABLE stream_sources ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Active streams table
ALTER TABLE active_streams ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Source destinations table
ALTER TABLE source_destinations ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Subscription plans table
ALTER TABLE subscription_plans ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- User subscriptions table
ALTER TABLE user_subscriptions ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Usage tracking table
ALTER TABLE usage_tracking ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Plan limits tracking table
ALTER TABLE plan_limits_tracking ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Payment orders table
ALTER TABLE payment_orders ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Payments table
ALTER TABLE payments ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Chat connectors table
ALTER TABLE chat_connectors ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Chat messages table
ALTER TABLE chat_messages ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Chat sessions table
ALTER TABLE chat_sessions ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Admin settings table
ALTER TABLE admin_settings ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Create indexes for UUID columns for better performance
CREATE INDEX CONCURRENTLY idx_users_uuid ON users(uuid);
CREATE INDEX CONCURRENTLY idx_stream_sources_uuid ON stream_sources(uuid);
CREATE INDEX CONCURRENTLY idx_active_streams_uuid ON active_streams(uuid);
CREATE INDEX CONCURRENTLY idx_source_destinations_uuid ON source_destinations(uuid);
CREATE INDEX CONCURRENTLY idx_subscription_plans_uuid ON subscription_plans(uuid);
CREATE INDEX CONCURRENTLY idx_user_subscriptions_uuid ON user_subscriptions(uuid);
CREATE INDEX CONCURRENTLY idx_usage_tracking_uuid ON usage_tracking(uuid);
CREATE INDEX CONCURRENTLY idx_plan_limits_tracking_uuid ON plan_limits_tracking(uuid);
CREATE INDEX CONCURRENTLY idx_payment_orders_uuid ON payment_orders(uuid);
CREATE INDEX CONCURRENTLY idx_payments_uuid ON payments(uuid);
CREATE INDEX CONCURRENTLY idx_chat_connectors_uuid ON chat_connectors(uuid);
CREATE INDEX CONCURRENTLY idx_chat_messages_uuid ON chat_messages(uuid);
CREATE INDEX CONCURRENTLY idx_chat_sessions_uuid ON chat_sessions(uuid);
CREATE INDEX CONCURRENTLY idx_admin_settings_uuid ON admin_settings(uuid);

-- Note: We're not changing foreign key relationships yet to maintain backward compatibility
-- Future migrations can update foreign keys to reference UUIDs when ready