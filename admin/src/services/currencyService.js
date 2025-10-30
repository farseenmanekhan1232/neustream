import api from './api';

class CurrencyService {
  /**
   * Get user's currency preference
   */
  async getCurrencyPreference() {
    try {
      const response = await api.get('/api/admin/settings/currency');
      return response.data;
    } catch (error) {
      console.error('Failed to get currency preference:', error);
      throw error;
    }
  }

  /**
   * Update user's currency preference
   */
  async updateCurrencyPreference(preference) {
    try {
      const response = await api.post('/api/admin/settings/currency', {
        currency_preference: preference
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update currency preference:', error);
      throw error;
    }
  }

  /**
   * Get current currency context (for debugging)
   */
  async getCurrencyContext() {
    try {
      const response = await api.get('/api/admin/currency/context');
      return response.data;
    } catch (error) {
      console.error('Failed to get currency context:', error);
      throw error;
    }
  }

  /**
   * Update exchange rate (admin only)
   */
  async updateExchangeRate(rate, fromCurrency = 'USD', toCurrency = 'INR') {
    try {
      const response = await api.post('/api/admin/currency/exchange-rate', {
        rate,
        from_currency: fromCurrency,
        to_currency: toCurrency
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update exchange rate:', error);
      throw error;
    }
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

    if (currency === 'INR') {
      return `₹${numAmount.toLocaleString('en-IN')}`;
    }
    return `$${numAmount.toFixed(2)}`;
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
}

export default new CurrencyService();