import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Theme } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * RouteAwareThemeProvider automatically sets the theme based on the current route
 * - Dashboard routes (starting with /dashboard): dark mode
 * - All other routes: light mode
 */
export function RouteAwareThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    // Determine theme based on route
    const isDashboardRoute = location.pathname.startsWith("/dashboard");

    // Set theme: dark for dashboard, light for everything else
    const newTheme: Theme = isDashboardRoute ? "dark" : "light";
    setTheme(newTheme);
  }, [location.pathname, setTheme]);

  // This component doesn't render anything, it just manages the theme
  return <>{children}</>;
}
