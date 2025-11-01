-- Migration: Add missing UUID foreign key columns for active_streams table
-- This migration adds user_uuid and source_uuid columns to active_streams table
-- to support UUID-based API endpoints

-- Add user_uuid column to active_streams (references users.uuid)
DO $$
BEGIN
    ALTER TABLE active_streams ADD COLUMN user_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for user_uuid
DO $$
BEGIN
    ALTER TABLE active_streams ADD CONSTRAINT active_streams_user_uuid_fkey
        FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Add source_uuid column to active_streams (references stream_sources.uuid)
DO $$
BEGIN
    ALTER TABLE active_streams ADD COLUMN source_uuid UUID;
EXCEPTION
    WHEN duplicate_column THEN
        NULL; -- Column already exists, that's fine
END $$;

-- Add foreign key constraint for source_uuid
DO $$
BEGIN
    ALTER TABLE active_streams ADD CONSTRAINT active_streams_source_uuid_fkey
        FOREIGN KEY (source_uuid) REFERENCES stream_sources(uuid) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint already exists
END $$;

-- Update existing data to populate UUID foreign keys
UPDATE active_streams as_ SET
    user_uuid = u.uuid,
    source_uuid = ss.uuid
FROM users u, stream_sources ss
WHERE as_.user_id = u.id AND as_.source_id = ss.id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_streams_user_uuid ON active_streams(user_uuid);
CREATE INDEX IF NOT EXISTS idx_active_streams_source_uuid ON active_streams(source_uuid);