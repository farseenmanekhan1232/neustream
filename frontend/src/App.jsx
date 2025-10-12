import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./components/DashboardOverview";
import DestinationsManager from "./components/DestinationsManager";
import { usePostHog } from "./hooks/usePostHog";

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(null);
  const { identifyUser, resetUser } = usePostHog();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("neustream_user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Identify user in PostHog
      identifyUser(userData.id, { email: userData.email });
    }
  }, [identifyUser]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("neustream_user", JSON.stringify(userData));
    // Identify user in PostHog
    identifyUser(userData.id, { email: userData.email });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("neustream_user");
    // Reset user in PostHog
    resetUser();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Auth onLogin={handleLogin} />
              )
            }
          />

          {/* Dashboard routes with layout */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <Outlet />
                </DashboardLayout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          >
            <Route index element={<DashboardOverview user={user} />} />
            <Route
              path="destinations"
              element={<DestinationsManager user={user} />}
            />
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
                    Account settings coming soon!
                  </p>
                </div>
              }
            />
          </Route>

          {/* Legacy dashboard route for backward compatibility */}
          <Route
            path="/dashboard/old"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
