import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import DashboardSidebar from "./DashboardSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell } from "lucide-react";

function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const { trackUIInteraction } = usePostHog();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getPageTitle = () => {
    const navItems = [
      {
        id: "overview",
        label: "Overview",
        path: "/dashboard",
      },
      {
        id: "streaming",
        label: "Streaming Configuration",
        path: "/dashboard/streaming",
      },
      {
        id: "preview",
        label: "Stream Preview",
        path: "/dashboard/preview",
      },
      {
        id: "subscription",
        label: "Subscription",
        path: "/dashboard/subscription",
      },
      {
        id: "analytics",
        label: "Analytics",
        path: "/dashboard/analytics",
      },
      {
        id: "settings",
        label: "Settings",
        path: "/dashboard/settings",
      },
    ];

    const currentNav = navItems.find((item) => item.path === location.pathname);
    return currentNav?.label || "Dashboard";
  };

  const getPageDescription = () => {
    const navItems = [
      {
        id: "overview",
        label: "Overview",
        path: "/dashboard",
        description: "View your streaming setup",
      },
      {
        id: "streaming",
        label: "Streaming Configuration",
        path: "/dashboard/streaming",
        description: "Manage sources and destinations",
      },
      {
        id: "preview",
        label: "Stream Preview",
        path: "/dashboard/preview",
        description: "Monitor live streams and chat",
      },
      {
        id: "subscription",
        label: "Subscription",
        path: "/dashboard/subscription",
        description: "Manage your subscription plan",
      },
      {
        id: "analytics",
        label: "Analytics",
        path: "/dashboard/analytics",
        description: "Track performance metrics",
      },
      {
        id: "settings",
        label: "Settings",
        path: "/dashboard/settings",
        description: "Configure your account",
      },
    ];

    const currentNav = navItems.find((item) => item.path === location.pathname);
    return currentNav?.description || "Manage your streaming setup";
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Enhanced Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div>
                <div className="text-2xl font-semibold">{getPageTitle()}</div>
                <p className="text-sm text-muted-foreground">
                  {getPageDescription()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => trackUIInteraction("notifications_click", "click", { page: location.pathname })}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || user.email}
                    className="rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {(user?.displayName || user?.email)
                      ?.charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {isMounted ? (
              children
            ) : (
              <div className="animate-pulse">Loading...</div>
            )}
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;