import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // Check if this is an OAuth callback (has token in URL)
  const urlParams = new URLSearchParams(location.search);
  const hasOAuthToken = urlParams.has("token");

  console.log("=== PROTECTED ROUTE DEBUG ===");
  console.log("Path:", location.pathname);
  console.log("Require auth:", requireAuth);
  console.log("User:", user);
  console.log("Loading:", loading);
  console.log("Has OAuth token:", hasOAuthToken);
  console.log("Is processing OAuth:", isProcessingOAuth);
  console.log("Full URL:", window.location.href);

  // Handle OAuth callback processing state
  useEffect(() => {
    if (hasOAuthToken && location.pathname === "/auth") {
      setIsProcessingOAuth(true);
      console.log("OAuth callback detected, setting processing state...");

      // Give AuthContext time to process the token
      const timer = setTimeout(() => {
        setIsProcessingOAuth(false);
        console.log("OAuth processing timeout completed");
      }, 3000); // 3 second timeout

      return () => clearTimeout(timer);
    }
  }, [hasOAuthToken, location.pathname]);

  // Show loading during initial loading or OAuth processing
  if (loading || isProcessingOAuth) {
    console.log("Showing loading screen...", { loading, isProcessingOAuth });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isProcessingOAuth ? "Completing sign-in..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // For OAuth callbacks, let AuthContext handle the processing
  if (hasOAuthToken && location.pathname === "/auth") {
    console.log("OAuth callback detected, allowing AuthContext to process...");
    return children;
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    console.log("User not authenticated, redirecting to auth...");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated and visiting auth page (without OAuth callback), redirect to dashboard
  if (!requireAuth && user) {
    console.log("Authenticated user on auth page, redirecting to dashboard...");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Allowing access to route");
  return children;
}

export default ProtectedRoute;
