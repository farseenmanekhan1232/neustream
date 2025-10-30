-- Add currency support to subscription plans
ALTER TABLE subscription_plans
ADD COLUMN price_monthly_inr INTEGER,
ADD COLUMN price_yearly_inr INTEGER;

-- Create admin settings table for currency preferences
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  currency_preference VARCHAR(3) DEFAULT 'AUTO', -- 'AUTO', 'USD', 'INR'
  auto_detect_currency BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create IP location cache to reduce API calls
CREATE TABLE ip_location_cache (
  ip_address INET PRIMARY KEY,
  country_code VARCHAR(2),
  currency VARCHAR(3),
  is_india BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Create currency rate cache
CREATE TABLE currency_rates (
  from_currency VARCHAR(3),
  to_currency VARCHAR(3),
  rate DECIMAL(10,6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour'),
  PRIMARY KEY (from_currency, to_currency)
);

-- Insert default USD to INR rate
INSERT INTO currency_rates (from_currency, to_currency, rate, expires_at)
VALUES ('USD', 'INR', 83.50, CURRENT_TIMESTAMP + INTERVAL '1 hour');

-- Update existing subscription plans with INR prices (1 USD = 83.5 INR)
UPDATE subscription_plans
SET price_monthly_inr = ROUND(price_monthly * 83.5),
    price_yearly_inr = ROUND(price_yearly * 83.5)
WHERE price_monthly > 0;

-- Create index for faster lookups
CREATE INDEX idx_ip_location_cache_expires ON ip_location_cache(expires_at);
CREATE INDEX idx_currency_rates_expires ON currency_rates(expires_at);
CREATE INDEX idx_admin_settings_user_id ON admin_settings(user_id);