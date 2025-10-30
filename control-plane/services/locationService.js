const fetch = require('node-fetch');
const db = require('../db');

class LocationService {
  constructor() {
    this.IP_API_BASE = 'http://ip-api.com/json';
    this.DEFAULT_RATE = 83.5; // USD to INR
  }

  /**
   * Detect user location from IP address with caching
   */
  async detectLocation(ipAddress) {
    try {
      // Clean and validate IP
      const cleanIp = this.cleanIpAddress(ipAddress);
      if (!cleanIp) {
        return this.getDefaultLocation();
      }

      // Check cache first
      const cached = await this.getCachedLocation(cleanIp);
      if (cached && !this.isExpired(cached)) {
        return cached;
      }

      // Fetch from external API
      const location = await this.fetchFromApi(cleanIp);

      // Cache the result
      await this.cacheLocation(cleanIp, location);

      return location;
    } catch (error) {
      console.error('Location detection failed:', error);
      return this.getDefaultLocation();
    }
  }

  /**
   * Fetch location data from ip-api.com
   */
  async fetchFromApi(ipAddress) {
    const url = `${this.IP_API_BASE}/${ipAddress}?fields=status,countryCode,currency`;

    const response = await fetch(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'NeuStream/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`IP API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'success') {
      return this.getDefaultLocation();
    }

    return {
      countryCode: data.countryCode,
      currency: data.currency || 'USD',
      isIndia: data.countryCode === 'IN',
      rate: data.currency === 'INR' ? await this.getExchangeRate() : 1
    };
  }

  /**
   * Get cached location from database
   */
  async getCachedLocation(ipAddress) {
    try {
      const result = await db.query(
        `SELECT country_code, currency, is_india, created_at
         FROM ip_location_cache
         WHERE ip_address = $1 AND expires_at > CURRENT_TIMESTAMP`,
        [ipAddress]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          countryCode: row.country_code,
          currency: row.currency,
          isIndia: row.is_india,
          rate: row.currency === 'INR' ? await this.getExchangeRate() : 1,
          cached: true
        };
      }
    } catch (error) {
      console.error('Cache lookup failed:', error);
    }
    return null;
  }

  /**
   * Cache location result in database
   */
  async cacheLocation(ipAddress, location) {
    try {
      await db.query(
        `INSERT INTO ip_location_cache (ip_address, country_code, currency, is_india, expires_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '24 hours')
         ON CONFLICT (ip_address) DO UPDATE SET
         country_code = EXCLUDED.country_code,
         currency = EXCLUDED.currency,
         is_india = EXCLUDED.is_india,
         expires_at = EXCLUDED.expires_at`,
        [ipAddress, location.countryCode, location.currency, location.isIndia]
      );
    } catch (error) {
      console.error('Cache storage failed:', error);
    }
  }

  /**
   * Get current USD to INR exchange rate
   */
  async getExchangeRate() {
    try {
      // Check cache first
      const result = await db.query(
        `SELECT rate FROM currency_rates
         WHERE from_currency = 'USD' AND to_currency = 'INR'
         AND expires_at > CURRENT_TIMESTAMP`
      );

      if (result.rows.length > 0) {
        return parseFloat(result.rows[0].rate);
      }

      // Fallback to default rate
      return this.DEFAULT_RATE;
    } catch (error) {
      console.error('Exchange rate lookup failed:', error);
      return this.DEFAULT_RATE;
    }
  }

  /**
   * Update exchange rate in cache
   */
  async updateExchangeRate(rate) {
    try {
      await db.query(
        `INSERT INTO currency_rates (from_currency, to_currency, rate, expires_at)
         VALUES ('USD', 'INR', $1, CURRENT_TIMESTAMP + INTERVAL '1 hour')
         ON CONFLICT (from_currency, to_currency) DO UPDATE SET
         rate = EXCLUDED.rate,
         expires_at = EXCLUDED.expires_at`,
        [rate]
      );
    } catch (error) {
      console.error('Exchange rate update failed:', error);
    }
  }

  /**
   * Clean and validate IP address
   */
  cleanIpAddress(ipAddress) {
    if (!ipAddress) return null;

    // Remove IPv6 prefix if present
    let cleanIp = ipAddress.replace(/^::ffff:/, '');

    // Basic IP validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    if (ipv4Regex.test(cleanIp)) return cleanIp;
    if (ipv6Regex.test(cleanIp)) return cleanIp;

    return null;
  }

  /**
   * Check if cached data is expired
   */
  isExpired(cachedData) {
    return !cachedData || !cachedData.cached;
  }

  /**
   * Get default location (US)
   */
  getDefaultLocation() {
    return {
      countryCode: 'US',
      currency: 'USD',
      isIndia: false,
      rate: 1,
      cached: false
    };
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache() {
    try {
      await db.query('DELETE FROM ip_location_cache WHERE expires_at < CURRENT_TIMESTAMP');
      await db.query('DELETE FROM currency_rates WHERE expires_at < CURRENT_TIMESTAMP');
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }
}

module.exports = new LocationService();