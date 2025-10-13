import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if this is an OAuth callback (has token in URL)
  const urlParams = new URLSearchParams(location.search);
  const hasOAuthToken = urlParams.has('token');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow OAuth callbacks to proceed even if user is authenticated
  if (requireAuth && !user) {
    // Redirect to login with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requireAuth && user && !hasOAuthToken) {
    // Redirect authenticated users away from auth pages, but allow OAuth callbacks
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;