// Theme and UI types

import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  defaultTheme: Theme;
  storageKey: string;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
}

export interface ThemeProviderProps {
  defaultTheme?: Theme;
  storageKey?: string;
  children: ReactNode;
}

export interface ClassValue {
  clsx?: string;
  tw?: string;
}

export interface ComponentVariants {
  variant?: string;
  size?: string;
  className?: string;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  items?: NavigationItem[];
}

export interface UserNavigationItem extends NavigationItem {
  userId: string;
  avatar?: string;
}

export interface SidebarConfig {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
