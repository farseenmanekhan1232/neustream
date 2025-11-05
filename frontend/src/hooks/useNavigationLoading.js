import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";

// Create a context for loading state
export const LoadingContext = React.createContext({
  setIsLoading: () => {},
});

export function useNavigationLoading() {
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