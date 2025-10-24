export const DASHBOARD_NAVIGATION = [
  {
    id: "overview",
    label: "Overview",
    path: "/dashboard",
    description: "View your streaming setup",
    icon: "LayoutDashboard",
  },
  {
    id: "streaming",
    label: "Streaming Configuration",
    path: "/dashboard/streaming",
    description: "Manage sources and destinations",
    icon: "MonitorSpeaker",
  },
  {
    id: "preview",
    label: "Stream Preview",
    path: "/dashboard/preview",
    description: "Monitor live streams and chat",
    icon: "Radio",
  },
  {
    id: "subscription",
    label: "Subscription",
    path: "/dashboard/subscription",
    description: "Manage your subscription plan",
    icon: "Crown",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/dashboard/analytics",
    description: "Track performance metrics",
    icon: "BarChart3",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/dashboard/settings",
    description: "Configure your account",
    icon: "Settings",
  },
];

export const getPageTitle = (pathname) => {
  const currentNav = DASHBOARD_NAVIGATION.find((item) => item.path === pathname);
  return currentNav?.label || "Dashboard";
};

export const getPageDescription = (pathname) => {
  const currentNav = DASHBOARD_NAVIGATION.find((item) => item.path === pathname);
  return currentNav?.description || "Manage your streaming setup";
};

export const getNavigationItem = (pathname) => {
  return DASHBOARD_NAVIGATION.find((item) => item.path === pathname);
};