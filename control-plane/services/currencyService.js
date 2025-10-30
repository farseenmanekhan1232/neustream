const Database = require('../lib/database');

class CurrencyService {
  constructor() {
    this.db = new Database();
    this.DEFAULT_USD_TO_INR_RATE = 83.5;
    this.SUPPORTED_CURRENCIES = ['USD', 'INR'];
  }

  /**
   * Convert price from USD to target currency
   */
  convertPrice(usdPrice, targetCurrency, exchangeRate = null) {
    if (!this.isValidCurrency(targetCurrency)) {
      throw new Error(`Unsupported currency: ${targetCurrency}`);
    }

    if (targetCurrency === 'USD') {
      return Math.round(usdPrice * 100) / 100; // Keep 2 decimal places
    }

    if (targetCurrency === 'INR') {
      const rate = exchangeRate || this.DEFAULT_USD_TO_INR_RATE;
      return Math.round(usdPrice * rate);
    }

    return usdPrice;
  }

  /**
   * Format price for display
   */
  formatPrice(amount, currency) {
    // Convert to number and validate
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      console.error('Invalid amount for formatting:', amount);
      return currency === 'INR' ? '₹0' : '$0.00';
    }

    if (!this.isValidCurrency(currency)) {
      return `$${numAmount.toFixed(2)}`;
    }

    if (currency === 'INR') {
      return `₹${numAmount.toLocaleString('en-IN')}`;
    }

    return `$${numAmount.toFixed(2)}`;
  }

  /**
   * Get currency-specific prices for subscription plans
   */
  async getSubscriptionPlans(currency = 'USD') {
    try {
      const result = await this.db.query(`
        SELECT
          id,
          name,
          description,
          max_sources,
          max_destinations,
          max_streaming_hours_monthly,
          features,
          is_active,
          CASE
            WHEN $1 = 'INR' THEN price_monthly_inr
            ELSE price_monthly
          END as price_monthly,
          CASE
            WHEN $1 = 'INR' THEN price_yearly_inr
            ELSE price_yearly
          END as price_yearly
        FROM subscription_plans
        WHERE is_active = true
        ORDER BY price_monthly ASC
      `, [currency]);

      return result.map(plan => ({
        ...plan,
        currency,
        formatted_price_monthly: this.formatPrice(plan.price_monthly, currency),
        formatted_price_yearly: this.formatPrice(plan.price_yearly, currency)
      }));
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get currency preference for user
   */
  async getUserCurrencyPreference(userId) {
    try {
      const result = await this.db.query(
        'SELECT currency_preference FROM admin_settings WHERE user_id = $1',
        [userId]
      );

      if (result.length > 0) {
        return result[0].currency_preference;
      }

      return 'AUTO'; // Default to auto-detection
    } catch (error) {
      console.error('Failed to get user currency preference:', error);
      return 'AUTO';
    }
  }

  /**
   * Set currency preference for user
   */
  async setUserCurrencyPreference(userId, currencyPreference) {
    if (!['AUTO', 'USD', 'INR'].includes(currencyPreference)) {
      throw new Error('Invalid currency preference');
    }

    try {
      await this.db.query(`
        INSERT INTO admin_settings (user_id, currency_preference)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET
        currency_preference = EXCLUDED.currency_preference,
        updated_at = CURRENT_TIMESTAMP
      `, [userId, currencyPreference]);

      return currencyPreference;
    } catch (error) {
      console.error('Failed to set user currency preference:', error);
      throw error;
    }
  }

  /**
   * Determine effective currency based on user preference and location
   */
  async determineEffectiveCurrency(userId, locationData) {
    try {
      // Get user preference
      const userPreference = await this.getUserCurrencyPreference(userId);

      // If user has manual preference, use it
      if (userPreference !== 'AUTO') {
        return userPreference;
      }

      // Use location-based currency
      if (locationData && locationData.currency) {
        return this.SUPPORTED_CURRENCIES.includes(locationData.currency)
          ? locationData.currency
          : 'USD';
      }

      // Default to USD
      return 'USD';
    } catch (error) {
      console.error('Failed to determine effective currency:', error);
      return 'USD';
    }
  }

  /**
   * Get exchange rate from cache or use default
   */
  async getExchangeRate(fromCurrency = 'USD', toCurrency = 'INR') {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      try {
        const result = await this.db.query(
          'SELECT rate FROM currency_rates WHERE from_currency = $1 AND to_currency = $2 AND expires_at > CURRENT_TIMESTAMP',
          [fromCurrency, toCurrency]
        );

        if (result.length > 0) {
          return parseFloat(result[0].rate);
        }
      } catch (error) {
        console.error('Failed to get exchange rate from cache:', error);
      }

      return this.DEFAULT_USD_TO_INR_RATE;
    }

    return 1;
  }

  /**
   * Update exchange rate in cache
   */
  async updateExchangeRate(rate, fromCurrency = 'USD', toCurrency = 'INR') {
    if (fromCurrency !== 'USD' || toCurrency !== 'INR') {
      throw new Error('Only USD to INR conversion is currently supported');
    }

    try {
      await this.db.query(`
        INSERT INTO currency_rates (from_currency, to_currency, rate, expires_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '1 hour')
        ON CONFLICT (from_currency, to_currency) DO UPDATE SET
        rate = EXCLUDED.rate,
        expires_at = EXCLUDED.expires_at
      `, [fromCurrency, toCurrency, rate]);
    } catch (error) {
      console.error('Failed to update exchange rate:', error);
      throw error;
    }
  }

  /**
   * Validate currency code
   */
  isValidCurrency(currency) {
    return this.SUPPORTED_CURRENCIES.includes(currency);
  }

  /**
   * Get currency info for display
   */
  getCurrencyInfo(currency) {
    const info = {
      USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
      INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' }
    };

    return info[currency] || info.USD;
  }

  /**
   * Process subscription plan with currency - use database values directly
   */
  async processPlanWithCurrency(plan, currency, exchangeRate = null) {
    if (!plan) return null;

    // Use currency-specific prices directly from database
    let monthlyPrice, yearlyPrice;

    if (currency === 'INR') {
      // Use INR prices from database directly - no conversion
      monthlyPrice = plan.price_monthly_inr;
      yearlyPrice = plan.price_yearly_inr;
    } else {
      // Use USD prices from database directly
      monthlyPrice = plan.price_monthly;
      yearlyPrice = plan.price_yearly;
    }

    return {
      ...plan,
      currency,
      price_monthly: monthlyPrice,
      price_yearly: yearlyPrice,
      formatted_price_monthly: this.formatPrice(monthlyPrice, currency),
      formatted_price_yearly: this.formatPrice(yearlyPrice, currency)
    };
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache() {
    try {
      await this.db.query('DELETE FROM currency_rates WHERE expires_at < CURRENT_TIMESTAMP');
    } catch (error) {
      console.error('Failed to cleanup currency cache:', error);
    }
  }
}

module.exports = new CurrencyService();