-- Migration: Add TOTP and streaming session support
-- This migration adds TOTP authentication and session management for secure stream key handling

-- Add TOTP columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS totp_secret TEXT,
ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS backup_codes JSONB,
ADD COLUMN IF NOT EXISTS streaming_session_duration INTEGER DEFAULT 14400; -- 4 hours in seconds

-- Add encrypted stream key columns to destinations table
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS stream_key_encrypted JSONB,
ADD COLUMN IF NOT EXISTS totp_secret_encrypted TEXT;

-- Add encrypted stream key columns to source_destinations table
ALTER TABLE source_destinations
ADD COLUMN IF NOT EXISTS stream_key_encrypted JSONB,
ADD COLUMN IF NOT EXISTS totp_secret_encrypted TEXT;

-- Create streaming_sessions table
CREATE TABLE IF NOT EXISTS streaming_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(64) UNIQUE NOT NULL,
  stream_keys JSONB NOT NULL, -- Encrypted stream keys for this session
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,

  -- Indexes for performance
  CONSTRAINT streaming_sessions_token_unique UNIQUE (session_token)
);

-- Indexes for fast session lookups
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_user_id ON streaming_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_expires_at ON streaming_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_active ON streaming_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_token ON streaming_sessions(session_token);

-- Index for JSONB queries on stream_keys
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_stream_keys
ON streaming_sessions USING GIN (stream_keys);

-- Create session_events table for audit logging
CREATE TABLE IF NOT EXISTS session_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_token VARCHAR(64),
  event_type VARCHAR(50) NOT NULL, -- 'created', 'revoked', 'expired', 'accessed'
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for session events
CREATE INDEX IF NOT EXISTS idx_session_events_user_id ON session_events(user_id);
CREATE INDEX IF NOT EXISTS idx_session_events_session_token ON session_events(session_token);
CREATE INDEX IF NOT EXISTS idx_session_events_created_at ON session_events(created_at);

-- Add comments for documentation
COMMENT ON TABLE streaming_sessions IS 'Stores active streaming sessions with encrypted stream keys';
COMMENT ON COLUMN streaming_sessions.stream_keys IS 'JSON object mapping stream keys to encrypted destination keys';
COMMENT ON COLUMN streaming_sessions.session_token IS 'Unique token for session identification';

COMMENT ON TABLE session_events IS 'Audit log for streaming session events';
COMMENT ON COLUMN users.totp_secret IS 'TOTP secret for two-factor authentication';
COMMENT ON COLUMN users.backup_codes IS 'Hashed backup codes for emergency access';

-- Insert default configuration
INSERT INTO app_config (key, value, description) VALUES
('totp_enabled_by_default', 'false', 'Whether TOTP is enabled for new users by default'),
('session_duration_hours', '4', 'Default streaming session duration in hours'),
('max_concurrent_sessions', '1', 'Maximum number of concurrent streaming sessions per user')
ON CONFLICT (key) DO NOTHING;