import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./components/DashboardOverview";
import DestinationsManager from "./components/DestinationsManager";
import StreamSources from "./components/StreamSources";
import { usePostHog } from "./hooks/usePostHog";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Main app component with auth provider
function AppContent() {
  const { user, loading } = useAuth();
  const { identifyUser, resetUser } = usePostHog();

  // Handle user identification for PostHog
  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        oauthProvider: user.oauthProvider,
      });
    } else {
      resetUser();
    }
  }, [user, identifyUser, resetUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Auth routes - redirect authenticated users to dashboard */}
      <Route
        path="/auth"
        element={
          <ProtectedRoute requireAuth={false}>
            <Auth />
          </ProtectedRoute>
        }
      />

      {/* Dashboard routes - require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
              <Outlet />
            </DashboardLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="sources" element={<StreamSources />} />
        <Route path="destinations" element={<DestinationsManager />} />
        <Route
          path="analytics"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <p className="text-muted-foreground">
                Coming soon! Track your stream performance and viewer
                engagement.
              </p>
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-muted-foreground">
                Account settings coming soon! Manage your profile, streaming
                preferences, and integrations.
              </p>
            </div>
          }
        />
      </Route>

      {/* Legacy dashboard route for backward compatibility */}
      <Route
        path="/dashboard/old"
        element={
          <ProtectedRoute requireAuth={true}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
