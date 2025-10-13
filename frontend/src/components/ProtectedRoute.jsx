import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if this is an OAuth callback (has token in URL)
  const urlParams = new URLSearchParams(location.search);
  const hasOAuthToken = urlParams.has("token");

  console.log("=== PROTECTED ROUTE DEBUG ===");
  console.log("Path:", location.pathname);
  console.log("Require auth:", requireAuth);
  console.log("User:", user);
  console.log("Loading:", loading);
  console.log("Has OAuth token:", hasOAuthToken);
  console.log("Full URL:", window.location.href);

  if (loading) {
    console.log("Showing loading screen...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Special handling for OAuth callbacks - always allow them to proceed
  if (hasOAuthToken && location.pathname === "/auth") {
    console.log("OAuth callback detected, allowing to proceed...");
    return children;
  }

  // Allow OAuth callbacks to proceed even if user is authenticated
  if (requireAuth && !user) {
    console.log("User not authenticated, redirecting to auth...");
    // Redirect to login with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requireAuth && user && !hasOAuthToken) {
    console.log(
      "Authenticated user on auth page without OAuth token, redirecting to dashboard..."
    );
    // Redirect authenticated users away from auth pages, but allow OAuth callbacks
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Allowing access to route");
  return children;
}

export default ProtectedRoute;
