-- Migration: Add user limit overrides table
-- Purpose: Allow admins to override plan limits for specific users

CREATE TABLE user_limit_overrides (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  limit_type VARCHAR(50) NOT NULL, -- 'max_sources', 'max_destinations', 'max_streaming_hours_monthly', 'max_chat_connectors'
  override_value INTEGER NOT NULL,
  reason TEXT,
  created_by INTEGER NOT NULL,
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_limit_overrides_user_id ON user_limit_overrides(user_id);
CREATE INDEX idx_user_limit_overrides_user_active ON user_limit_overrides(user_id, is_active);
CREATE INDEX idx_user_limit_overrides_limit_type ON user_limit_overrides(limit_type);
CREATE INDEX idx_user_limit_overrides_expires_at ON user_limit_overrides(expires_at);
CREATE INDEX idx_user_limit_overrides_created_by ON user_limit_overrides(created_by);

-- Foreign key constraints
ALTER TABLE user_limit_overrides
  ADD CONSTRAINT fk_user_limit_overrides_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_limit_overrides
  ADD CONSTRAINT fk_user_limit_overrides_created_by
  FOREIGN KEY (created_by) REFERENCES users(id);

-- Prevent duplicate active overrides for the same user and limit_type
CREATE UNIQUE INDEX idx_user_limit_overrides_unique_active
ON user_limit_overrides(user_id, limit_type)
WHERE is_active = true;

-- Comments
COMMENT ON TABLE user_limit_overrides IS 'Admin overrides for user plan limits (e.g., increase sources beyond plan)';
COMMENT ON COLUMN user_limit_overrides.limit_type IS 'Type of limit: max_sources, max_destinations, max_streaming_hours_monthly, max_chat_connectors';
COMMENT ON COLUMN user_limit_overrides.override_value IS 'The override value for this limit';
COMMENT ON COLUMN user_limit_overrides.reason IS 'Admin-provided reason for the override';
COMMENT ON COLUMN user_limit_overrides.expires_at IS 'Optional expiration date for the override';
COMMENT ON COLUMN user_limit_overrides.is_active IS 'Soft delete flag - use false instead of deleting';

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_limit_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_limit_overrides_updated_at
  BEFORE UPDATE ON user_limit_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_user_limit_overrides_updated_at();
