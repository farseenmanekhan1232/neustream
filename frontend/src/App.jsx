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
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./components/DashboardOverview";
import StreamingConfiguration from "./components/StreamingConfiguration";
import StreamPreviewPage from "./components/StreamPreviewPage";
import SubscriptionManagement from "./components/SubscriptionManagement";
import PublicChatPage from "./components/PublicChatPage";
import SetupGuide from "./pages/SetupGuide";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Features from "./pages/Features";
import { usePostHog } from "./hooks/usePostHog";
import { useEffect } from "react";
import { ThemeProvider } from "./components/theme-provider";

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

      {/* Public pages */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/help" element={<SetupGuide />} />
      <Route path="/features" element={<Features />} />

      {/* Blog routes */}
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />

      {/* Public legal pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Public chat route for OBS integration */}
      <Route path="/chat/:sourceId" element={<PublicChatPage />} />

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
        <Route path="streaming" element={<StreamingConfiguration />} />
        <Route path="destinations" element={<StreamingConfiguration />} />
        <Route path="preview" element={<StreamPreviewPage />} />
        <Route path="subscription" element={<SubscriptionManagement />} />
        <Route
          path="analytics"
          element={
            <div className="w-full px-6 py-6 space-y-6  mx-auto">
              <div className="text-center py-12">
                <h2 className="text-2xl font-normal mb-4">Analytics</h2>
                <p className="text-muted-foreground">
                  Coming soon! Track your stream performance and viewer
                  engagement.
                </p>
              </div>
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="w-full px-6 py-6 space-y-6  mx-auto">
              <div className="text-center py-12">
                <h2 className="text-2xl font-normal mb-4">Settings</h2>
                <p className="text-muted-foreground">
                  Account settings coming soon! Manage your profile, streaming
                  preferences, and integrations.
                </p>
              </div>
            </div>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
