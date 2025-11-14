import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceBannerProps {
  isVisible: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * Banner component to display when the API is down
 */
export const MaintenanceBanner = ({
  isVisible,
  onRetry,
  isRetrying,
}: MaintenanceBannerProps) => {
  if (!isVisible) return null;

  return (
    <Alert
      variant="default"
      className="mx-4 sm:mx-6 lg:mx-8 mt-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50"
    >
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className="font-semibold text-amber-800 dark:text-amber-200">
            Service temporarily unavailable
          </span>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            We're experiencing technical difficulties. Authentication is currently
            unavailable. Please try again in a few moments.
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50 whitespace-nowrap"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${
                isRetrying ? "animate-spin" : ""
              }`}
            />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
