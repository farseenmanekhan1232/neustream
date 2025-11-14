import { Request, Response, NextFunction } from 'express';
import locationService from '../services/locationService.js';
import currencyService from '../services/currencyService.js';

interface LocationData {
  countryCode?: string;
  currency?: string;
  isIndia?: boolean;
  rate?: number;
}

interface CurrencyContext {
  ip: string;
  location: LocationData | null;
  currency: string;
  exchangeRate: number;
}

// Extend Express Request to include currencyContext
declare global {
  namespace Express {
    interface Request {
      currencyContext?: CurrencyContext;
    }
  }
}

/**
 * Middleware to detect user location and set currency context
 */
export const detectCurrency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get client IP address
    const clientIp = getClientIp(req);

    // Get user ID if authenticated
    const userId = (req as any).user?.id;

    // Detect location from IP
    const location = await locationService.detectLocation(clientIp);

    // Determine effective currency based on user preference and location
    let effectiveCurrency: string;
    if (userId) {
      effectiveCurrency = await currencyService.determineEffectiveCurrency(userId, location);
    } else {
      // For non-authenticated users, use location-based currency
      effectiveCurrency = location.currency === 'INR' ? 'INR' : 'USD';
    }

    // Store currency context in request
    req.currencyContext = {
      ip: clientIp,
      location,
      currency: effectiveCurrency,
      exchangeRate: location.rate || 1
    };

    console.log(`💰 Currency context set: ${effectiveCurrency} for IP ${clientIp} (${location.countryCode})`);

    next();
  } catch (error) {
    console.error('Currency detection failed:', error);

    // Fallback to USD on error
    req.currencyContext = {
      ip: getClientIp(req),
      location: null,
      currency: 'USD',
      exchangeRate: 1
    };

    next();
  }
};

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string {
  // Check various headers that might contain the real IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  // Check headers
  for (const header of headers) {
    const value = req.headers[header];
    if (value) {
      // Handle comma-separated IPs (take the first one)
      const ip = value.split(',')[0].trim();
      if (isValidIp(ip)) {
        return ip;
      }
    }
  }

  // Fallback to req.ip or req.connection.remoteAddress
  const ip = req.ip || (req.connection as any)?.remoteAddress || '127.0.0.1';

  // Handle IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }

  // Remove IPv6 prefix if present
  return ip.replace(/^::ffff:/, '');
}

/**
 * Basic IP validation
 */
export function isValidIp(ip: string): boolean {
  if (!ip) return false;

  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 validation (simplified)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Middleware to require currency context
 */
export const requireCurrencyContext = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.currencyContext) {
    res.status(500).json({
      error: 'Currency context not available',
      message: 'Currency detection middleware must be applied first'
    });
    return;
  }
  next();
};

/**
 * Get currency context for API responses
 */
export const getCurrencyContext = (req: Request): CurrencyContext => {
  return req.currencyContext || {
    currency: 'USD',
    exchangeRate: 1,
    location: null,
    ip: ''
  };
};

export default {
  detectCurrency,
  requireCurrencyContext,
  getCurrencyContext,
  getClientIp
};
