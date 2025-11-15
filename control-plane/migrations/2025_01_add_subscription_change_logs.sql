-- Migration: Add subscription change logs table
-- Purpose: Track all subscription changes for audit trail

CREATE TABLE subscription_change_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  from_plan_id INTEGER,
  to_plan_id INTEGER NOT NULL,
  change_type VARCHAR(20) NOT NULL, -- 'promotion', 'demotion', 'upgrade', 'downgrade'
  reason TEXT,
  admin_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Additional data about the change
);

-- Indexes for performance
CREATE INDEX idx_subscription_change_logs_user_id ON subscription_change_logs(user_id);
CREATE INDEX idx_subscription_change_logs_created_at ON subscription_change_logs(created_at);
CREATE INDEX idx_subscription_change_logs_admin_id ON subscription_change_logs(admin_id);

-- Foreign key constraints
ALTER TABLE subscription_change_logs
  ADD CONSTRAINT fk_subscription_change_logs_user_id
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE subscription_change_logs
  ADD CONSTRAINT fk_subscription_change_logs_from_plan_id
  FOREIGN KEY (from_plan_id) REFERENCES subscription_plans(id);

ALTER TABLE subscription_change_logs
  ADD CONSTRAINT fk_subscription_change_logs_to_plan_id
  FOREIGN KEY (to_plan_id) REFERENCES subscription_plans(id);

ALTER TABLE subscription_change_logs
  ADD CONSTRAINT fk_subscription_change_logs_admin_id
  FOREIGN KEY (admin_id) REFERENCES users(id);

-- Comments
COMMENT ON TABLE subscription_change_logs IS 'Audit log for all subscription changes (promotions, demotions, etc.)';
COMMENT ON COLUMN subscription_change_logs.change_type IS 'Type of change: promotion, demotion, upgrade, downgrade';
COMMENT ON COLUMN subscription_change_logs.reason IS 'Admin-provided reason for the change';
COMMENT ON COLUMN subscription_change_logs.metadata IS 'Additional JSON data about the change (amounts, proration, etc.)';
