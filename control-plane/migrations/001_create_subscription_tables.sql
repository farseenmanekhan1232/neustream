-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  max_sources INTEGER DEFAULT 1,
  max_destinations INTEGER DEFAULT 3,
  max_streaming_hours_monthly INTEGER DEFAULT 50,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  billing_cycle VARCHAR(10),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
  stream_start TIMESTAMP NOT NULL,
  stream_end TIMESTAMP,
  duration_minutes INTEGER,
  month_year VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create plan limits tracking table
CREATE TABLE IF NOT EXISTS plan_limits_tracking (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_sources_count INTEGER DEFAULT 0,
  current_destinations_count INTEGER DEFAULT 0,
  current_month_streaming_hours DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON usage_tracking(month_year);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_stream_end ON usage_tracking(stream_end);

-- Insert default subscription plans
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
  '{"analytics": "basic", "support": "community"}'
),
(
  'Pro',
  'For serious streamers who need more flexibility',
  19.00,
  190.00,
  3,
  10,
  200,
  '{"analytics": "advanced", "support": "priority", "custom_branding": true}'
),
(
  'Business',
  'For professional broadcasters and organizations',
  49.00,
  490.00,
  10,
  9999, -- Effectively unlimited
  1000,
  '{"analytics": "enterprise", "support": "dedicated", "api_access": true, "custom_integrations": true}'
)
ON CONFLICT DO NOTHING;

-- Create function to update plan limits tracking
CREATE OR REPLACE FUNCTION update_plan_limits_tracking()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    target_user_id INTEGER;
  BEGIN
    -- Determine the user_id based on operation type
    IF TG_OP = 'DELETE' THEN
      target_user_id := OLD.user_id;
    ELSE
      target_user_id := NEW.user_id;
    END IF;

    -- Update sources count
    UPDATE plan_limits_tracking
    SET current_sources_count = (
      SELECT COUNT(*) FROM stream_sources WHERE user_id = target_user_id
    ),
    last_updated = NOW()
    WHERE user_id = target_user_id;

    -- Insert if doesn't exist
    IF NOT FOUND THEN
      INSERT INTO plan_limits_tracking (user_id, current_sources_count)
      VALUES (
        target_user_id,
        (SELECT COUNT(*) FROM stream_sources WHERE user_id = target_user_id)
      );
    END IF;

    RETURN COALESCE(NEW, OLD);
  END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stream sources
DROP TRIGGER IF EXISTS update_plan_limits_on_source ON stream_sources;
CREATE TRIGGER update_plan_limits_on_source
  AFTER INSERT OR DELETE ON stream_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_limits_tracking();

-- Create function to update destinations count
CREATE OR REPLACE FUNCTION update_destinations_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update destinations count
  UPDATE plan_limits_tracking
  SET current_destinations_count = (
    SELECT COUNT(*) FROM source_destinations
    JOIN stream_sources ON source_destinations.source_id = stream_sources.id
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

-- Create trigger for source destinations
DROP TRIGGER IF EXISTS update_plan_limits_on_destination ON source_destinations;
CREATE TRIGGER update_plan_limits_on_destination
  AFTER INSERT OR DELETE ON source_destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_destinations_count();

-- Create function to update streaming hours
CREATE OR REPLACE FUNCTION update_streaming_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Update streaming hours for current month
  UPDATE plan_limits_tracking
  SET current_month_streaming_hours = (
    SELECT COALESCE(SUM(duration_minutes), 0)/60.0
    FROM usage_tracking
    WHERE user_id = NEW.user_id
    AND month_year = TO_CHAR(NOW(), 'YYYY-MM')
  ),
  last_updated = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for usage tracking
DROP TRIGGER IF EXISTS update_plan_limits_on_usage ON usage_tracking;
CREATE TRIGGER update_plan_limits_on_usage
  AFTER INSERT OR UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_streaming_hours();