import React, { createContext, useContext, useState, useEffect } from 'react';
import currencyService from '../services/currencyService';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [currencyPreference, setCurrencyPreference] = useState('AUTO');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load currency preference on mount
  useEffect(() => {
    loadCurrencyPreference();
  }, []);

  const loadCurrencyPreference = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await currencyService.getCurrencyPreference();
      const { preference, currency: currencyInfo } = response.data;

      setCurrencyPreference(preference);
      setCurrency(preference === 'AUTO' ? 'USD' : preference); // Default to USD for AUTO initially

      // Load currency context to get actual detected currency
      await loadCurrencyContext();
    } catch (err) {
      console.error('Failed to load currency preference:', err);
      setError(err.message);
      // Fallback to USD
      setCurrency('USD');
      setCurrencyPreference('AUTO');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencyContext = async () => {
    try {
      const response = await currencyService.getCurrencyContext();
      const { currency: detectedCurrency, location: detectedLocation } = response.data;

      setCurrency(detectedCurrency);
      setLocation(detectedLocation);
    } catch (err) {
      console.error('Failed to load currency context:', err);
      // Keep existing currency settings
    }
  };

  const updateCurrencyPreference = async (newPreference) => {
    try {
      setLoading(true);
      setError(null);

      const response = await currencyService.updateCurrencyPreference(newPreference);
      const { preference } = response.data;

      setCurrencyPreference(preference);

      // Reload currency context to get updated currency
      await loadCurrencyContext();

      return preference;
    } catch (err) {
      console.error('Failed to update currency preference:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    return currencyService.formatPrice(amount, currency);
  };

  const getCurrencyInfo = () => {
    return currencyService.getCurrencyInfo(currency);
  };

  const value = {
    currency,
    currencyPreference,
    location,
    loading,
    error,
    formatPrice,
    getCurrencyInfo,
    updateCurrencyPreference,
    reloadCurrencyContext: loadCurrencyContext
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;