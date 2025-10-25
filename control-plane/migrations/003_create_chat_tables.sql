-- Create chat connector configurations per source
CREATE TABLE IF NOT EXISTS chat_connectors (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'twitch', 'youtube', 'facebook', 'custom'
    connector_type VARCHAR(50) NOT NULL, -- 'oauth', 'api_key', 'webhook'
    config JSONB NOT NULL, -- OAuth tokens, API keys, webhook URLs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Aggregated chat messages from all connectors
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
    connector_id INTEGER REFERENCES chat_connectors(id),
    platform_message_id VARCHAR(255), -- Original message ID from platform
    author_name VARCHAR(255) NOT NULL,
    author_id VARCHAR(255), -- Platform-specific user ID
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'subscription', 'donation'
    metadata JSONB, -- Platform-specific metadata
    created_at TIMESTAMP DEFAULT NOW()
);

-- Real-time chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
    session_key VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_connectors_source_id ON chat_connectors(source_id);
CREATE INDEX IF NOT EXISTS idx_chat_connectors_platform ON chat_connectors(platform);
CREATE INDEX IF NOT EXISTS idx_chat_connectors_is_active ON chat_connectors(is_active);

CREATE INDEX IF NOT EXISTS idx_chat_messages_source_id ON chat_messages(source_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_connector_id ON chat_messages(connector_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_platform_message_id ON chat_messages(platform_message_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_source_id ON chat_sessions(source_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_key ON chat_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_active ON chat_sessions(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chat_connectors updated_at
DROP TRIGGER IF EXISTS update_chat_connectors_updated_at ON chat_connectors;
CREATE TRIGGER update_chat_connectors_updated_at
    BEFORE UPDATE ON chat_connectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default chat connector platforms configuration
INSERT INTO subscription_plans (
    name, description, price_monthly, price_yearly,
    max_sources, max_destinations, max_streaming_hours_monthly, features
) VALUES
(
    'Free',
    'Perfect for getting started with multi-platform streaming',
    0.00,
    0.00,
    1,
    3,
    50,
    '{"analytics": "basic", "support": "community", "chat_connectors": 1}'
),
(
    'Pro',
    'For serious streamers who need more flexibility',
    19.00,
    190.00,
    3,
    10,
    200,
    '{"analytics": "advanced", "support": "priority", "custom_branding": true, "chat_connectors": 3}'
),
(
    'Business',
    'For professional broadcasters and organizations',
    49.00,
    490.00,
    10,
    9999, -- Effectively unlimited
    1000,
    '{"analytics": "enterprise", "support": "dedicated", "api_access": true, "custom_integrations": true, "chat_connectors": 9999}'
)
ON CONFLICT (name) DO UPDATE SET
    features = EXCLUDED.features,
    updated_at = NOW();