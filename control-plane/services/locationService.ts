import Database from '../lib/database';

interface LocationData {
  countryCode: string;
  currency: string;
  isIndia: boolean;
  rate: number;
  cached?: boolean;
}

interface CachedLocation {
  country_code: string;
  currency: string;
  is_india: boolean;
  created_at: Date;
}

interface CurrencyRate {
  rate: number;
}

interface IpApiResponse {
  status: string;
  countryCode?: string;
  currency?: string;
}

/**
 * Location Service
 * Detects user location from IP address with caching
 * Handles currency detection and exchange rate management
 */
class LocationService {
  private db: Database;
  private IP_API_BASE: string;
  private DEFAULT_RATE: number;

  constructor() {
    this.db = new Database();
    this.IP_API_BASE = 'http://ip-api.com/json';
    this.DEFAULT_RATE = 83.5; // USD to INR
  }

  /**
   * Detect user location from IP address with caching
   */
  async detectLocation(ipAddress: string): Promise<LocationData> {
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
   * Type guard to check if data has the expected IpApiResponse structure
   */
  private isIpApiResponse(data: unknown): data is IpApiResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'status' in data &&
      typeof (data as IpApiResponse).status === 'string'
    );
  }

  /**
   * Fetch location data from ip-api.com
   */
  async fetchFromApi(ipAddress: string): Promise<LocationData> {
    const url = `${this.IP_API_BASE}/${ipAddress}?fields=status,countryCode,currency`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'NeuStream/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`IP API returned ${response.status}`);
      }

      const data: unknown = await response.json();

      // Type guard to ensure data has the expected structure
      if (!this.isIpApiResponse(data) || data.status !== 'success') {
        return this.getDefaultLocation();
      }

      return {
        countryCode: data.countryCode || 'US',
        currency: data.currency || 'USD',
        isIndia: data.countryCode === 'IN',
        rate: data.currency === 'INR' ? await this.getExchangeRate() : 1
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      return this.getDefaultLocation();
    }
  }

  /**
   * Get cached location from database
   */
  async getCachedLocation(ipAddress: string): Promise<LocationData | null> {
    try {
      const result = await this.db.query<CachedLocation>(
        `SELECT country_code, currency, is_india, created_at
         FROM ip_location_cache
         WHERE ip_address = $1 AND expires_at > CURRENT_TIMESTAMP`,
        [ipAddress]
      );

      if (result.length > 0) {
        const row = result[0];
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
  async cacheLocation(ipAddress: string, location: LocationData): Promise<void> {
    try {
      await this.db.query(
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
  async getExchangeRate(): Promise<number> {
    try {
      // Check cache first
      const result = await this.db.query<CurrencyRate>(
        `SELECT rate FROM currency_rates
         WHERE from_currency = 'USD' AND to_currency = 'INR'
         AND expires_at > CURRENT_TIMESTAMP`
      );

      if (result.length > 0) {
        return parseFloat(result[0].rate.toString());
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
  async updateExchangeRate(rate: number): Promise<void> {
    try {
      await this.db.query(
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
  cleanIpAddress(ipAddress: string): string | null {
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
  isExpired(cachedData: any): boolean {
    return !cachedData || !cachedData.cached;
  }

  /**
   * Get default location (US)
   */
  getDefaultLocation(): LocationData {
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
  async cleanupExpiredCache(): Promise<void> {
    try {
      await this.db.query('DELETE FROM ip_location_cache WHERE expires_at < CURRENT_TIMESTAMP');
      await this.db.query('DELETE FROM currency_rates WHERE expires_at < CURRENT_TIMESTAMP');
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }
}

export default new LocationService();
