-- Add chat connector tracking to plan_limits_tracking table
ALTER TABLE plan_limits_tracking
ADD COLUMN IF NOT EXISTS current_chat_connectors_count INTEGER DEFAULT 0;

-- Create function to update chat connectors count
CREATE OR REPLACE FUNCTION update_chat_connectors_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update chat connectors count
  UPDATE plan_limits_tracking
  SET current_chat_connectors_count = (
    SELECT COUNT(*) FROM chat_connectors
    JOIN stream_sources ON chat_connectors.source_id = stream_sources.id
    WHERE stream_sources.user_id = (
      SELECT user_id FROM stream_sources WHERE id = (
        CASE
          WHEN TG_OP = 'INSERT' THEN NEW.source_id
          WHEN TG_OP = 'DELETE' THEN OLD.source_id
        END
      )
    )
  ),
  last_updated = NOW()
  WHERE user_id = (
    SELECT user_id FROM stream_sources WHERE id = (
      CASE
        WHEN TG_OP = 'INSERT' THEN NEW.source_id
        WHEN TG_OP = 'DELETE' THEN OLD.source_id
      END
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chat connectors
DROP TRIGGER IF EXISTS update_plan_limits_on_chat_connector ON chat_connectors;
CREATE TRIGGER update_plan_limits_on_chat_connector
  AFTER INSERT OR DELETE ON chat_connectors
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_connectors_count();

-- Update existing users with current chat connector counts
UPDATE plan_limits_tracking plt
SET current_chat_connectors_count = (
  SELECT COUNT(*)
  FROM chat_connectors cc
  JOIN stream_sources ss ON cc.source_id = ss.id
  WHERE ss.user_id = plt.user_id
);