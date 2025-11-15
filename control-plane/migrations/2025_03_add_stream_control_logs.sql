-- Migration: Add stream control logs table
-- Purpose: Track all stream control actions (stop, etc.) for audit trail

CREATE TABLE stream_control_logs (
  id SERIAL PRIMARY KEY,
  stream_key VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'stopped_by_admin', 'auto_stopped', etc.
  reason TEXT,
  admin_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Additional data about the action
);

-- Indexes for performance
CREATE INDEX idx_stream_control_logs_stream_key ON stream_control_logs(stream_key);
CREATE INDEX idx_stream_control_logs_created_at ON stream_control_logs(created_at);
CREATE INDEX idx_stream_control_logs_admin_id ON stream_control_logs(admin_id);

-- Foreign key constraints
ALTER TABLE stream_control_logs
  ADD CONSTRAINT fk_stream_control_logs_admin_id
  FOREIGN KEY (admin_id) REFERENCES users(id);

-- Comments
COMMENT ON TABLE stream_control_logs IS 'Audit log for all stream control actions (stop, etc.)';
COMMENT ON COLUMN stream_control_logs.action IS 'Type of action: stopped_by_admin, auto_stopped, etc.';
COMMENT ON COLUMN stream_control_logs.reason IS 'Admin-provided reason for the action';
COMMENT ON COLUMN stream_control_logs.metadata IS 'Additional JSON data about the action';
