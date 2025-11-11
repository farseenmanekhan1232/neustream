import { useEffect, useContext, createContext, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface LoadingContextType {
  setIsLoading: (loading: boolean) => void;
}

export const LoadingContext = createContext<LoadingContextType>({
  setIsLoading: () => {},
});

export function useNavigationLoading(): void {
  const location = useLocation();
  const { setIsLoading } = useContext(LoadingContext);

  useEffect(() => {
    // Show loading state when route changes
    setIsLoading(true);

    // Hide loading state after a short delay to simulate content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms delay for skeleton visibility

    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading]);
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
