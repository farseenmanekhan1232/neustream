-- Subscription Management Schema
-- Migration: 001_create_subscription_tables.sql
-- Author: Claude Code
-- Date: 2025-10-19

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_monthly INTEGER NOT NULL, -- in cents/paisa
    price_yearly INTEGER, -- in cents/paisa, NULL if not available
    stripe_price_id VARCHAR(255), -- Stripe price ID for monthly
    stripe_yearly_price_id VARCHAR(255), -- Stripe price ID for yearly

    -- Feature limits
    max_stream_sources INTEGER NOT NULL DEFAULT 1,
    max_simultaneous_destinations INTEGER NOT NULL DEFAULT 2,
    max_streaming_hours_monthly INTEGER NOT NULL DEFAULT 50,

    -- Additional features
    has_advanced_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    has_priority_support BOOLEAN NOT NULL DEFAULT FALSE,
    has_custom_rtmp BOOLEAN NOT NULL DEFAULT FALSE,
    has_stream_preview BOOLEAN NOT NULL DEFAULT FALSE,
    has_team_access BOOLEAN NOT NULL DEFAULT FALSE,
    has_custom_branding BOOLEAN NOT NULL DEFAULT FALSE,
    has_api_access BOOLEAN NOT NULL DEFAULT FALSE,

    -- Plan metadata
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL,

    -- Subscription details
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, canceled, expired, past_due
    billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly', -- monthly, yearly

    -- Razorpay subscription details
    razorpay_subscription_id VARCHAR(255) UNIQUE,
    razorpay_customer_id VARCHAR(255),
    razorpay_plan_id VARCHAR(255),

    -- Billing period
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Cancellation details
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,

    -- Trial period
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id) -- One active subscription per user
);

-- ============================================
-- PAYMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE SET NULL,

    -- Payment details
    amount INTEGER NOT NULL, -- in cents/paisa
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL, -- succeeded, failed, pending, refunded

    -- Razorpay details
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_order_id VARCHAR(255),
    razorpay_invoice_id VARCHAR(255),

    -- Payment metadata
    description TEXT,
    payment_method VARCHAR(50), -- card, upi, netbanking, wallet

    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USAGE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Usage metrics for current billing period
    streaming_hours_used DECIMAL(10,2) NOT NULL DEFAULT 0,
    active_stream_sources INTEGER NOT NULL DEFAULT 0,
    total_destinations INTEGER NOT NULL DEFAULT 0,

    -- Billing period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, period_start) -- One record per user per period
);

-- ============================================
-- SUBSCRIPTION EVENTS TABLE (for webhooks)
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_events (
    id SERIAL PRIMARY KEY,

    -- Event details
    event_type VARCHAR(100) NOT NULL, -- subscription.created, payment.succeeded, etc.
    razorpay_event_id VARCHAR(255) UNIQUE,

    -- Event data
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processing_error TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_public ON subscription_plans(is_public, is_active);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_razorpay_id ON user_subscriptions(razorpay_subscription_id);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_id ON payment_transactions(razorpay_payment_id);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- Subscription events indexes
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_processed ON subscription_events(processed);
CREATE INDEX IF NOT EXISTS idx_subscription_events_razorpay_id ON subscription_events(razorpay_event_id);

-- ============================================
-- INSERT DEFAULT SUBSCRIPTION PLANS
-- ============================================
INSERT INTO subscription_plans (
    name, description, price_monthly, price_yearly,
    max_stream_sources, max_simultaneous_destinations, max_streaming_hours_monthly,
    has_advanced_analytics, has_priority_support, has_custom_rtmp, has_stream_preview,
    has_team_access, has_custom_branding, has_api_access,
    sort_order
) VALUES
(
    'Free',
    'Perfect for casual streamers and hobbyists',
    0, 0,
    1, 2, 50,
    FALSE, FALSE, FALSE, FALSE,
    FALSE, FALSE, FALSE,
    1
),
(
    'Pro',
    'For professional streamers and content creators',
    1900, 19000, -- $19/month, $190/year (20% discount)
    3, 5, 200,
    TRUE, TRUE, TRUE, TRUE,
    FALSE, FALSE, FALSE,
    2
),
(
    'Business',
    'For professional studios and agencies',
    4900, 49000, -- $49/month, $490/year (16% discount)
    10, 15, 500,
    TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE,
    3
);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================
ALTER TABLE user_subscriptions ADD CONSTRAINT fk_user_subscriptions_plan_id
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);

ALTER TABLE payment_transactions ADD CONSTRAINT fk_payment_transactions_subscription_id
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL;