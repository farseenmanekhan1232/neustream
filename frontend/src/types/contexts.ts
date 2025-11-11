// Context and hook types

import { User } from "./auth";
import { Theme } from "./theme";

// Auth Context
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithTwitch: () => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Theme Context
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

export interface ThemeProviderProps {
  defaultTheme?: Theme;
  storageKey?: string;
  children: React.ReactNode;
}

// Currency Context
export interface CurrencyProviderProps {
  children: React.ReactNode;
}

// PostHog Hook
export interface UsePostHogReturn {
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => void;
  trackAuthEvent: (
    eventName: string,
    properties?: Record<string, unknown>,
  ) => void;
  trackStreamEvent: (
    streamKey: string,
    eventName: string,
    properties?: Record<string, unknown>,
  ) => void;
  trackDestinationEvent: (
    destinationId: string,
    eventName: string,
    properties?: Record<string, unknown>,
  ) => void;
  trackUIInteraction: (
    elementName: string,
    interactionType: string,
    properties?: Record<string, unknown>,
  ) => void;
  identifyUser: (userId: string, properties?: Record<string, unknown>) => void;
  resetUser: () => void;
  isEnabled: () => boolean;
}

// Navigation Loading Hook
export interface UseNavigationLoadingReturn {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
}

// Mobile Hook
export interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
}
