import api from './api';

class CurrencyService {
  /**
   * Get user's currency preference
   */
  async getCurrencyPreference() {
    try {
      const response = await api.get('/admin/settings/currency');
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
      const response = await api.post('/admin/settings/currency', {
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
      const response = await api.get('/admin/currency/context');
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
      const response = await api.post('/admin/currency/exchange-rate', {
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
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toFixed(2)}`;
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