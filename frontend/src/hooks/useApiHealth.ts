import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const HEALTH_CHECK_INTERVAL = 60000; // Check every 60 seconds

interface ApiHealthStatus {
  isHealthy: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

/**
 * Hook to monitor the health of the API by pinging the /health endpoint
 */
export const useApiHealth = (): ApiHealthStatus => {
  const [status, setStatus] = useState<ApiHealthStatus>({
    isHealthy: true,
    isChecking: false,
    lastChecked: null,
    error: null,
  });

  const checkHealth = async () => {
    setStatus((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Consider any non-2xx status as unhealthy
      const isHealthy = response.ok;

      setStatus({
        isHealthy,
        isChecking: false,
        lastChecked: new Date(),
        error: isHealthy ? null : `API returned status ${response.status}`,
      });
    } catch (error) {
      setStatus({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to server",
      });
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return status;
};
