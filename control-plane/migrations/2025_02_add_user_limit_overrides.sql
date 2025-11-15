-- Migration: Add user limit overrides table
-- Purpose: Allow admins to override plan limits for specific users
--
-- Note: Only numeric limits stored in subscription_plans.limits can be overridden.
-- Chat connectors are stored in subscription_plans.features and cannot be overridden via this table.

CREATE TABLE IF NOT EXISTS user_limit_overrides (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  limit_type VARCHAR(50) NOT NULL, -- 'max_sources', 'max_destinations', 'max_streaming_hours_monthly'
  override_value INTEGER NOT NULL,
  reason TEXT,
  created_by INTEGER NOT NULL,
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_limit_overrides_user_id ON user_limit_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_limit_overrides_user_active ON user_limit_overrides(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_limit_overrides_limit_type ON user_limit_overrides(limit_type);
CREATE INDEX IF NOT EXISTS idx_user_limit_overrides_expires_at ON user_limit_overrides(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_limit_overrides_created_by ON user_limit_overrides(created_by);

-- Foreign key constraints (idempotent)
DO $$ BEGIN
    ALTER TABLE user_limit_overrides
    ADD CONSTRAINT fk_user_limit_overrides_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE user_limit_overrides
    ADD CONSTRAINT fk_user_limit_overrides_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Prevent duplicate active overrides for the same user and limit_type (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_limit_overrides_unique_active
ON user_limit_overrides(user_id, limit_type)
WHERE is_active = true;

-- Comments
COMMENT ON TABLE user_limit_overrides IS 'Admin overrides for user plan limits (e.g., increase sources beyond plan)';
COMMENT ON COLUMN user_limit_overrides.limit_type IS 'Type of limit: max_sources, max_destinations, max_streaming_hours_monthly (from limits JSONB)';
COMMENT ON COLUMN user_limit_overrides.override_value IS 'The override value for this limit';
COMMENT ON COLUMN user_limit_overrides.reason IS 'Admin-provided reason for the override';
COMMENT ON COLUMN user_limit_overrides.expires_at IS 'Optional expiration date for the override';
COMMENT ON COLUMN user_limit_overrides.is_active IS 'Soft delete flag - use false instead of deleting';

-- Create trigger to auto-update updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_user_limit_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_user_limit_overrides_updated_at
      BEFORE UPDATE ON user_limit_overrides
      FOR EACH ROW
      EXECUTE FUNCTION update_user_limit_overrides_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
