import {
  LayoutDashboard,
  MonitorSpeaker,
  Radio,
  Crown,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

// Route configuration for the entire application
export const ROUTE_CONFIG = {
  // Public routes
  public: {
    landing: {
      path: "/",
      component: "Landing",
      title: "Home",
      description: "Neustream - Professional multistreaming platform",
    },
    about: {
      path: "/about",
      component: "AboutUs",
      title: "About Us",
      description: "Learn about Neustream",
    },
    contact: {
      path: "/contact",
      component: "Contact",
      title: "Contact",
      description: "Get in touch with our team",
    },
    faq: {
      path: "/faq",
      component: "FAQ",
      title: "FAQ",
      description: "Frequently asked questions",
    },
    features: {
      path: "/features",
      component: "Features",
      title: "Features",
      description: "Explore Neustream features",
    },
    blog: {
      path: "/blog",
      component: "Blog",
      title: "Blog",
      description: "Latest streaming tips and news",
    },
    blogPost: {
      path: "/blog/:slug",
      component: "BlogPost",
      title: "Blog Post",
      description: "Read our latest blog post",
    },
    privacy: {
      path: "/privacy",
      component: "PrivacyPolicy",
      title: "Privacy Policy",
      description: "Privacy policy",
    },
    terms: {
      path: "/terms",
      component: "TermsOfService",
      title: "Terms of Service",
      description: "Terms of service",
    },
    help: {
      path: "/help",
      component: "SetupGuide",
      title: "Setup Guide",
      description: "Get help and setup instructions",
    },
    publicChat: {
      path: "/chat/:sourceId",
      component: "PublicChatPage",
      title: "Public Chat",
      description: "Public chat for OBS integration",
    },
  },

  // Auth routes
  auth: {
    login: {
      path: "/auth",
      component: "Auth",
      title: "Sign In",
      description: "Sign in to your account",
      requireAuth: false,
    },
  },

  // Dashboard routes (protected)
  dashboard: {
    overview: {
      path: "/dashboard",
      component: "DashboardOverview",
      title: "Dashboard",
      description: "View your streaming setup",
      icon: LayoutDashboard,
      keywords: ["home", "main", "dashboard", "overview"],
      shortcut: "1",
    },
    streaming: {
      path: "/dashboard/streaming",
      component: "StreamingConfiguration",
      title: "Streaming Configuration",
      description: "Manage sources and destinations",
      icon: MonitorSpeaker,
      keywords: ["config", "setup", "sources", "destinations", "streaming"],
      shortcut: "2",
    },
    destinations: {
      path: "/dashboard/destinations",
      component: "StreamingConfiguration",
      title: "Destinations",
      description: "Manage streaming destinations",
      icon: MonitorSpeaker,
      keywords: ["destinations", "platforms", "streaming"],
      shortcut: "2",
    },
    preview: {
      path: "/dashboard/preview",
      component: "StreamPreviewPage",
      title: "Stream Preview",
      description: "Monitor live streams and chat",
      icon: Radio,
      keywords: ["preview", "live", "stream", "monitor"],
      shortcut: "3",
      showLiveIndicator: true,
    },
    subscription: {
      path: "/dashboard/subscription",
      component: "SubscriptionManagement",
      title: "Subscription",
      description: "Manage your subscription plan",
      icon: Crown,
      keywords: ["subscription", "plan", "billing", "payment"],
      shortcut: "4",
    },
    analytics: {
      path: "/dashboard/analytics",
      component: "Analytics",
      title: "Analytics",
      description: "Track performance metrics",
      icon: BarChart3,
      keywords: ["analytics", "metrics", "statistics", "performance"],
      shortcut: "5",
      badge: "Soon",
    },
    settings: {
      path: "/dashboard/settings",
      component: "Settings",
      title: "Settings",
      description: "Configure your account",
      icon: Settings,
      keywords: ["settings", "preferences", "configuration", "account"],
      shortcut: "6",
    },
  },
};

// Navigation groups for sidebar
export const SIDEBAR_NAVIGATION_GROUPS = [
  {
    title: "Streaming",
    items: [
      ROUTE_CONFIG.dashboard.overview,
      ROUTE_CONFIG.dashboard.streaming,
      ROUTE_CONFIG.dashboard.preview,
    ],
  },
  {
    title: "Account",
    items: [
      ROUTE_CONFIG.dashboard.subscription,
      ROUTE_CONFIG.dashboard.analytics,
      ROUTE_CONFIG.dashboard.settings,
    ],
  },
  {
    title: "Support",
    items: [
      {
        ...ROUTE_CONFIG.public.help,
        icon: HelpCircle,
        keywords: ["help", "guide", "tutorial", "setup", "support"],
        shortcut: "7",
      },
    ],
  },
];

// Helper functions
export const getRouteByPath = (path) => {
  for (const category of Object.values(ROUTE_CONFIG)) {
    for (const route of Object.values(category)) {
      if (route.path === path) return route;
    }
  }
  return null;
};

export const getDashboardNavigation = () => {
  return Object.values(ROUTE_CONFIG.dashboard);
};

export const getPageTitle = (pathname) => {
  const route = getRouteByPath(pathname);
  return route?.title || "Neustream";
};

export const getPageDescription = (pathname) => {
  const route = getRouteByPath(pathname);
  return route?.description || "Professional multistreaming platform";
};