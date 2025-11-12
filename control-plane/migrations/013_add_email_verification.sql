-- Migration: Add Email Verification Support
-- Date: 2025-11-12

-- Add email verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_expires ON users(email_verification_expires);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_expires ON users(password_reset_expires);

-- Add comment
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN users.email_verification_token IS 'Token sent to user email for verification';
COMMENT ON COLUMN users.email_verification_expires IS 'Expiration time for email verification token';
COMMENT ON COLUMN users.password_reset_token IS 'Token sent to user email for password reset';
COMMENT ON COLUMN users.password_reset_expires IS 'Expiration time for password reset token';
