import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { usePostHog } from "./hooks/usePostHog";
import { ThemeProvider } from "./components/theme-provider.jsx";

// Main layout component
const Layout = lazy(() => import("./components/Layout"));

// Lazy loaded components for code splitting
const Landing = lazy(() => import("./pages/Landing.jsx"));
const Auth = lazy(() => import("./pages/Auth.jsx"));
const AboutUs = lazy(() => import("./pages/AboutUs.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const FAQ = lazy(() => import("./pages/FAQ.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.jsx"));
const Features = lazy(() => import("./pages/Features.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
const SetupGuide = lazy(() => import("./pages/SetupGuide.jsx"));
const PublicChatPage = lazy(() => import("./components/PublicChatPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Dashboard components (also lazy loaded)
const DashboardLayout = lazy(
  () => import("./components/DashboardLayoutCustom.jsx"),
);
const StreamingConfiguration = lazy(
  () => import("./components/StreamingConfiguration.jsx"),
);
const StreamPreviewPage = lazy(
  () => import("./components/StreamPreviewPage.jsx"),
);
const SubscriptionManagement = lazy(
  () => import("./components/SubscriptionManagement.jsx"),
);
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));

interface LazyLoadingProps {
  message?: string;
}

// Loading component for lazy loading
const LazyLoading = ({ message = "Loading..." }: LazyLoadingProps) => (
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
            {/* Dashboard index - Stream Preview as main view */}
            <Route index element={<StreamPreviewPage />} />

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
