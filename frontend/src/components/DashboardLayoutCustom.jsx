import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
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
  IconCreditCard,
  IconPlayerPlay,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const data = {
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
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: IconCreditCard,
    },
    // {
    //   title: "Analytics",
    //   url: "/dashboard/analytics",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Settings",
    //   url: "/dashboard/settings",
    //   icon: IconSettings,
    // },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "/help",
      icon: IconHelp,
    },
  ],
};

function NavMain({ items, className, currentPath }) {
  return (
    <nav className={cn("grid gap-1 px-2", className)}>
      {items.map((item) => {
        const isActive =
          item.url === currentPath ||
          (item.url === "/dashboard" && currentPath === "/dashboard");
        return (
          <Button
            key={item.title}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start gap-2 text-sm transition-colors",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
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

function NavUser({ user, onLogout }) {
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="px-2 py-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 p-2 h-auto rounded-lg hover:bg-sidebar-accent"
          >
            <Avatar className="h-8 w-8">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || user.email}
                  className="rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.displayName || "User"}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                {user?.email}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" side="right">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.displayName || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard/settings" className="flex items-center">
              <IconSettings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>
            <IconLogout className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
  const { user, logout } = useAuth();

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
          sidebarOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="NeuStream"
              className="h-8 w-8 rounded-lg"
            />
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
          <NavUser user={user} onLogout={logout} />
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
          {isLoading ? <PageSkeleton /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
