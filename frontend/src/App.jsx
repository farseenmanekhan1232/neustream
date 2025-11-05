import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { usePostHog } from "./hooks/usePostHog";
import { useEffect } from "react";
import { ThemeProvider } from "./components/theme-provider";

// Main layout component
const Layout = lazy(() => import("./components/Layout"));

// Lazy loaded components for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Features = lazy(() => import("./pages/Features"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const SetupGuide = lazy(() => import("./pages/SetupGuide"));
const PublicChatPage = lazy(() => import("./components/PublicChatPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dashboard components (also lazy loaded)
const DashboardLayout = lazy(() => import("./components/DashboardLayoutCustom"));
const DashboardOverview = lazy(() => import("./components/DashboardOverview"));
const StreamingConfiguration = lazy(
  () => import("./components/StreamingConfiguration"),
);
const StreamPreviewPage = lazy(() => import("./components/StreamPreviewPage"));
const SubscriptionManagement = lazy(
  () => import("./components/SubscriptionManagement"),
);
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));

// Loading component for lazy loading
const LazyLoading = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

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
    <Suspense fallback={<LazyLoading />}>
      <Routes>
        {/* Main route with Layout wrapper */}
        <Route path="/" element={<Layout />}>
          {/* Landing page */}
          <Route index element={<Landing />} />

          {/* Public pages */}
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="features" element={<Features />} />
          <Route path="help" element={<SetupGuide />} />

          {/* Blog routes */}
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />

          {/* Legal pages */}
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />

          {/* Public utilities */}
          <Route path="chat/:sourceId" element={<PublicChatPage />} />

          {/* Authentication */}
          <Route
            path="auth"
            element={
              <ProtectedRoute requireAuth={false}>
                <Auth />
              </ProtectedRoute>
            }
          />

          {/* Protected dashboard routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requireAuth={true}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard index */}
            <Route index element={<DashboardOverview />} />

            {/* Streaming configuration */}
            <Route path="streaming" element={<StreamingConfiguration />} />
            <Route path="destinations" element={<StreamingConfiguration />} />

            {/* Stream preview */}
            <Route path="preview" element={<StreamPreviewPage />} />

            {/* Subscription management */}
            <Route path="subscription" element={<SubscriptionManagement />} />

            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
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
