import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { usePostHog } from "./hooks/usePostHog";
import { RouteAwareThemeProvider } from "./components/RouteAwareThemeProvider";
import { ThemeProvider } from "./contexts/ThemeContext";

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
const Alternatives = lazy(() => import("./pages/Alternatives"));
const RestreamAlternative = lazy(() => import("./pages/alternatives/RestreamAlternative"));
const OBSLiveAlternative = lazy(() => import("./pages/alternatives/OBSLiveAlternative"));
const StreamYardAlternative = lazy(() => import("./pages/alternatives/StreamYardAlternative"));
const CastrAlternative = lazy(() => import("./pages/alternatives/CastrAlternative"));

// Platform Guides
const YouTubeLiveGuide = lazy(() => import("./pages/guides/YouTubeLiveGuide"));
const TwitchGuide = lazy(() => import("./pages/guides/TwitchGuide"));
const FacebookLiveGuide = lazy(() => import("./pages/guides/FacebookLiveGuide"));
const LinkedInLiveGuide = lazy(() => import("./pages/guides/LinkedInLiveGuide"));
const TwitterLiveGuide = lazy(() => import("./pages/guides/TwitterLiveGuide"));
const InstagramLiveGuide = lazy(() => import("./pages/guides/InstagramLiveGuide"));
const TikTokLiveGuide = lazy(() => import("./pages/guides/TikTokLiveGuide"));
const KickGuide = lazy(() => import("./pages/guides/KickGuide"));
const RumbleGuide = lazy(() => import("./pages/guides/RumbleGuide"));
const DLiveGuide = lazy(() => import("./pages/guides/DLiveGuide"));
const TrovoGuide = lazy(() => import("./pages/guides/TrovoGuide"));
const CaffeineGuide = lazy(() => import("./pages/guides/CaffeineGuide"));
const NimoTVGuide = lazy(() => import("./pages/guides/NimoTVGuide"));
const SteamBroadcastingGuide = lazy(() => import("./pages/guides/SteamBroadcastingGuide"));
const VimeoLiveGuide = lazy(() => import("./pages/guides/VimeoLiveGuide"));
const DailymotionGuide = lazy(() => import("./pages/guides/DailymotionGuide"));
const IBMVideoStreamingGuide = lazy(() => import("./pages/guides/IBMVideoStreamingGuide"));
const WowzaGuide = lazy(() => import("./pages/guides/WowzaGuide"));
const BilibiliGuide = lazy(() => import("./pages/guides/BilibiliGuide"));
const DouyuGuide = lazy(() => import("./pages/guides/DouyuGuide"));
const HuyaGuide = lazy(() => import("./pages/guides/HuyaGuide"));
const AfreecaTVGuide = lazy(() => import("./pages/guides/AfreecaTVGuide"));
const NicoNicoGuide = lazy(() => import("./pages/guides/NicoNicoGuide"));
const OpenrecGuide = lazy(() => import("./pages/guides/OpenrecGuide"));
const BigoLiveGuide = lazy(() => import("./pages/guides/BigoLiveGuide"));
const NonoliveGuide = lazy(() => import("./pages/guides/NonoliveGuide"));
const VKLiveGuide = lazy(() => import("./pages/guides/VKLiveGuide"));
const OKruGuide = lazy(() => import("./pages/guides/OKruGuide"));
const VaughnLiveGuide = lazy(() => import("./pages/guides/VaughnLiveGuide"));
const PicartoGuide = lazy(() => import("./pages/guides/PicartoGuide"));
const MobcrushGuide = lazy(() => import("./pages/guides/MobcrushGuide"));
const PublicChatPage = lazy(() => import("./components/PublicChatPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Dashboard components (also lazy loaded)
const DashboardLayout = lazy(() => import("./components/DashboardLayout.jsx"));
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

const queryClient = new QueryClient();

// Main app component with auth provider
function AppContent() {
  const { user } = useAuth();
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

  return (
    <Routes>
      {/* Main route with Layout wrapper */}
      <Route path="/" element={<Layout />}>
        {/* Landing page - no auth loading needed */}
        <Route index element={<Landing />} />

        {/* Public pages */}
        <Route path="about" element={<AboutUs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="features" element={<Features />} />
        <Route path="help" element={<SetupGuide />}>
          <Route path="platforms/youtube-live" element={<YouTubeLiveGuide />} />
          <Route path="platforms/twitch" element={<TwitchGuide />} />
          <Route path="platforms/facebook-live" element={<FacebookLiveGuide />} />
          <Route path="platforms/linkedin-live" element={<LinkedInLiveGuide />} />
          <Route path="platforms/twitter-live" element={<TwitterLiveGuide />} />
          <Route path="platforms/instagram-live" element={<InstagramLiveGuide />} />
          <Route path="platforms/tiktok-live" element={<TikTokLiveGuide />} />
          <Route path="platforms/kick" element={<KickGuide />} />
          <Route path="platforms/rumble" element={<RumbleGuide />} />
          <Route path="platforms/dlive" element={<DLiveGuide />} />
          <Route path="platforms/trovo" element={<TrovoGuide />} />
          <Route path="platforms/caffeine" element={<CaffeineGuide />} />
          <Route path="platforms/nimo-tv" element={<NimoTVGuide />} />
          <Route path="platforms/steam-broadcasting" element={<SteamBroadcastingGuide />} />
          <Route path="platforms/vimeo-live" element={<VimeoLiveGuide />} />
          <Route path="platforms/dailymotion" element={<DailymotionGuide />} />
          <Route path="platforms/ibm-video-streaming" element={<IBMVideoStreamingGuide />} />
          <Route path="platforms/wowza" element={<WowzaGuide />} />
          <Route path="platforms/bilibili" element={<BilibiliGuide />} />
          <Route path="platforms/douyu" element={<DouyuGuide />} />
          <Route path="platforms/huya" element={<HuyaGuide />} />
          <Route path="platforms/afreecatv" element={<AfreecaTVGuide />} />
          <Route path="platforms/niconico" element={<NicoNicoGuide />} />
          <Route path="platforms/openrec" element={<OpenrecGuide />} />
          <Route path="platforms/bigo-live" element={<BigoLiveGuide />} />
          <Route path="platforms/nonolive" element={<NonoliveGuide />} />
          <Route path="platforms/vk-live" element={<VKLiveGuide />} />
          <Route path="platforms/ok-ru" element={<OKruGuide />} />
          <Route path="platforms/vaughn-live" element={<VaughnLiveGuide />} />
          <Route path="platforms/picarto" element={<PicartoGuide />} />
          <Route path="platforms/mobcrush" element={<MobcrushGuide />} />
        </Route>

        {/* Blog routes */}
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />

        {/* Legal pages */}
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />

        {/* Alternatives pages */}
        <Route path="alternatives" element={<Alternatives />} />
        <Route path="alternatives/restream" element={<RestreamAlternative />} />
        <Route path="alternatives/obs-live" element={<OBSLiveAlternative />} />
        <Route path="alternatives/streamyard" element={<StreamYardAlternative />} />
        <Route path="alternatives/castr" element={<CastrAlternative />} />

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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <Router>
            <RouteAwareThemeProvider>
              <AppContent />
            </RouteAwareThemeProvider>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
