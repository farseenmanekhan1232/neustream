import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconVideo,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconMessageCircle,
  IconSettings,
  IconHelp,
  IconSearch,
  IconUsers,
  IconBolt,
  IconEye,
  IconBroadcast,
  IconMicrophone,
  IconMenu2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const data = {
  user: {
    name: "NeuStream User",
    email: "user@neustream.app",
    avatar: "/logo.png",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: IconDashboard,
      isActive: true,
    },
    {
      title: "Streaming",
      url: "/dashboard/streaming",
      icon: IconBroadcast,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: IconSearch,
    },
  ],
};

function NavMain({ items, className, currentPath }) {
  return (
    <nav className={cn("grid gap-1 px-2", className)}>
      {items.map((item) => {
        const isActive = item.url === currentPath ||
                        (item.url === "/dashboard" && currentPath === "/dashboard");
        return (
          <Button
            key={item.title}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start gap-2 text-sm transition-colors",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
            asChild
          >
            <Link to={item.url}>
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

function NavSecondary({ items, className }) {
  return (
    <nav className={cn("grid gap-1 px-2", className)}>
      {items.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sm text-sidebar-foreground/70 transition-colors"
          asChild
        >
          <Link to={item.url}>
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

function NavUser({ user }) {
  return (
    <div className="px-2 py-1">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <IconVideo className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Table/List Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show skeleton when route changes
    setIsLoading(true);

    // Hide skeleton after content loads (simulate loading time)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // 600ms delay for better UX

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconVideo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">NeuStream</span>
              <span className="truncate text-xs">Streaming Platform</span>
            </div>
          </Link>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-4 py-4">
            <NavMain items={data.navMain} currentPath={location.pathname} />
            <div className="px-2 py-2">
              <Separator className="bg-sidebar-border" />
            </div>
            <NavSecondary items={data.navSecondary} />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-sidebar-border p-2">
          <NavUser user={data.user} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <IconMenu2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <PageSkeleton />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}