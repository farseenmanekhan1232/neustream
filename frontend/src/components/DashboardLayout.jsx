import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Toaster } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Radio,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  Menu,
  User,
  X,
  Bell,
  ChevronRight,
  MonitorSpeaker,
} from "lucide-react";
import { usePostHog } from "../hooks/usePostHog";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
    description: "View your streaming setup",
  },
  {
    id: "streaming",
    label: "Streaming Configuration",
    icon: MonitorSpeaker,
    path: "/dashboard/streaming",
    description: "Manage sources and destinations",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/dashboard/analytics",
    description: "Track performance metrics",
    badge: "Soon",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
    description: "Configure your account",
  },
];

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { trackUIInteraction } = usePostHog();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getPageTitle = () => {
    const currentNav = navItems.find((item) => item.path === location.pathname);
    return currentNav?.label || "Dashboard";
  };

  const getPageDescription = () => {
    const currentNav = navItems.find((item) => item.path === location.pathname);
    return currentNav?.description || "Manage your streaming setup";
  };

  const NavItem = ({ item, isActive, onClick, showTooltip = false }) => {
    const content = (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={onClick}
      >
        <item.icon className="h-4 w-4" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {showTooltip && (
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    );

    if (showTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{item.description}</TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const SidebarContent = ({ onNavigate }) => (
    <div className="flex h-full flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.email}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.displayName || user?.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.oauthProvider ? `${user.oauthProvider} User` : "Streamer"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => {
              if (onNavigate) onNavigate();
              // Track navigation clicks
              trackUIInteraction(`nav_${item.id}`, "click", {
                from_page: location.pathname,
                to_page: item.path,
                item_label: item.label,
              });
            }}
          >
            <NavItem
              item={item}
              isActive={location.pathname === item.path}
              onClick={() => {}}
            />
          </Link>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          asChild
        >
          <a href="/help" target="_blank" rel="noopener noreferrer">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 flex-col border-r bg-card">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent onNavigate={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <div className="text-2xl font-semibold">{getPageTitle()}</div>
                <p className="text-sm text-muted-foreground">
                  {getPageDescription()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
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
    </TooltipProvider>
  );
}

export default DashboardLayout;
