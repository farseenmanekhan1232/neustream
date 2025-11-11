import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { subscriptionService } from "../services/subscription";
import type { CurrencyContextType } from "@/types";

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<string>("USD");
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load currency context from subscription plans API
  useEffect(() => {
    loadCurrencyContext();
  }, []);

  const loadCurrencyContext = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Get subscription plans which now include currency information
      const response = await subscriptionService.getPlans();

      // Handle both direct data and wrapped response structures
      const plansData =
        (response as { data?: { currency?: string; location?: string } })
          .data || response;

      if (plansData && (plansData as { currency?: string }).currency) {
        setCurrency((plansData as { currency: string }).currency);
        setLocation((plansData as { location?: string }).location || null);
      } else if ((response as { currency?: string }).currency) {
        // Handle case where currency is directly in response
        setCurrency((response as { currency: string }).currency);
        setLocation((response as { location?: string }).location || null);
      } else {
        // Fallback to USD if no currency info
        setCurrency("USD");
      }
    } catch (err) {
      console.error("Failed to load currency context:", err);
      setError((err as Error).message);
      // Fallback to USD
      setCurrency("USD");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (
    amount: number | string,
    targetCurrency = currency,
  ): string => {
    // Convert to number and validate
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      console.error("Invalid amount for formatting:", amount);
      return targetCurrency === "INR" ? "₹0" : "$0";
    }

    if (targetCurrency === "INR") {
      return `₹${numAmount.toLocaleString("en-IN")}`;
    }
    return `$${numAmount.toFixed(2)}`;
  };

  const convertPrice = async (price: number): Promise<number> => {
    // For now, return the same price
    // In a real implementation, you would call an exchange rate API
    return price;
  };

  const value: CurrencyContextType = {
    currency,
    location,
    loading,
    error,
    formatPrice,
    convertPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
