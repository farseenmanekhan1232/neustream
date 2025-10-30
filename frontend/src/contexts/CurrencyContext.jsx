import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscription';

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
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load currency context from subscription plans API
  useEffect(() => {
    loadCurrencyContext();
  }, []);

  const loadCurrencyContext = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get subscription plans which now include currency information
      const response = await subscriptionService.getPlans();

      // Handle both direct data and wrapped response structures
      const plansData = response.data || response;

      if (plansData && plansData.currency) {
        setCurrency(plansData.currency);
        setLocation(plansData.location || null);
      } else if (response.currency) {
        // Handle case where currency is directly in response
        setCurrency(response.currency);
        setLocation(response.location || null);
      } else {
        // Fallback to USD if no currency info
        setCurrency('USD');
      }
    } catch (err) {
      console.error('Failed to load currency context:', err);
      setError(err.message);
      // Fallback to USD
      setCurrency('USD');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount, targetCurrency = currency) => {
    // Convert to number and validate
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      console.error('Invalid amount for formatting:', amount);
      return targetCurrency === 'INR' ? '₹0' : '$0';
    }

    if (targetCurrency === 'INR') {
      return `₹${numAmount.toLocaleString('en-IN')}`;
    }
    return `$${numAmount.toFixed(2)}`;
  };

  const getCurrencyInfo = (targetCurrency = currency) => {
    const info = {
      USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
      INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' }
    };

    return info[targetCurrency] || info.USD;
  };

  const value = {
    currency,
    location,
    loading,
    error,
    formatPrice,
    getCurrencyInfo,
    reloadCurrencyContext: loadCurrencyContext
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;