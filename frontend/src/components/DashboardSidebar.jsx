import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Radio,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  MonitorSpeaker,
  Crown,
  Circle,
  Users,
  Search,
  Command,
  X,
  Keyboard,
  Zap,
} from "lucide-react";

const navigationGroups = [
  {
    title: "Streaming",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        path: "/dashboard",
        description: "View your streaming setup",
        keywords: ["home", "main", "dashboard", "overview"],
        shortcut: "1",
      },
      {
        id: "streaming",
        label: "Configuration",
        icon: MonitorSpeaker,
        path: "/dashboard/streaming",
        description: "Manage sources and destinations",
        keywords: ["config", "setup", "sources", "destinations", "streaming"],
        shortcut: "2",
      },
      {
        id: "preview",
        label: "Stream Preview",
        icon: Radio,
        path: "/dashboard/preview",
        description: "Monitor live streams and chat",
        keywords: ["preview", "live", "stream", "monitor"],
        shortcut: "3",
        showLiveIndicator: true,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "subscription",
        label: "Subscription",
        icon: Crown,
        path: "/dashboard/subscription",
        description: "Manage your subscription plan",
        keywords: ["subscription", "plan", "billing", "payment"],
        shortcut: "4",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        path: "/dashboard/analytics",
        description: "Track performance metrics",
        keywords: ["analytics", "metrics", "statistics", "performance"],
        shortcut: "5",
        badge: "Soon",
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        path: "/dashboard/settings",
        description: "Configure your account",
        keywords: ["settings", "preferences", "configuration", "account"],
        shortcut: "6",
      },
    ],
  },
];

function DashboardSidebar() {
  const { user, logout } = useAuth();
  const { trackUIInteraction } = usePostHog();
  const location = useLocation();
  const { state } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Fetch streaming status for live indicators
  const { data: streamInfo, isLoading: isStreamLoading } = useQuery({
    queryKey: ["stream-info"],
    queryFn: async () => {
      const response = await apiService.get("/streams/info");
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Search shortcut: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchQuery("");
        const searchInput = document.querySelector("[data-sidebar-search]");
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Navigation shortcuts: Cmd/Ctrl + 1-6
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        const shortcutIndex = parseInt(e.key) - 1;
        const allItems = navigationGroups.flatMap((group) => group.items);
        const targetItem = allItems[shortcutIndex];
        if (targetItem) {
          handleNavigation(targetItem);
          window.location.href = targetItem.path;
        }
      }

      // Help shortcut: ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Escape to close search
      if (e.key === "Escape") {
        setSearchQuery("");
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [trackUIInteraction]);

  // Filter navigation items based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return navigationGroups;

    const query = searchQuery.toLowerCase();
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.keywords.some((keyword) =>
              keyword.toLowerCase().includes(query)
            )
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  const isActive = (path) => location.pathname === path;

  const isStreaming = useMemo(
    () => streamInfo?.sources?.some((source) => source.isActive),
    [streamInfo]
  );

  const viewerCount = useMemo(
    () => streamInfo?.totalViewers || 0,
    [streamInfo]
  );

  const handleNavigation = useCallback(
    (item) => {
      trackUIInteraction(`nav_${item.id}`, "click", {
        from_page: location.pathname,
        to_page: item.path,
        item_label: item.label,
      });
    },
    [trackUIInteraction, location.pathname]
  );

  const getUserInitials = useCallback(() => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  }, [user]);

  const getSubscriptionTier = useCallback(() => {
    if (user?.subscription?.plan) {
      return (
        user.subscription.plan.charAt(0).toUpperCase() +
        user.subscription.plan.slice(1)
      );
    }
    return "Free";
  }, [user]);

  const clearSearch = () => {
    setSearchQuery("");
    const searchInput = document.querySelector("[data-sidebar-search]");
    if (searchInput) {
      searchInput.focus();
    }
  };

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 relative">
              {user?.avatarUrl ? (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.displayName || user.email}
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              )}
              {/* Live streaming indicator */}
              {isStreaming && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </Avatar>

            {state !== "collapsed" && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.displayName || user?.email?.split("@")[0]}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getSubscriptionTier()}
                  </Badge>
                  {isStreaming && (
                    <Badge variant="destructive" className="text-xs">
                      <Circle className="h-2 w-2 fill-current mr-1" />
                      LIVE
                    </Badge>
                  )}
                </div>
                {viewerCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Users className="h-3 w-3 inline mr-1" />
                    {viewerCount} viewers
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Search Input */}
          {state !== "collapsed" && (
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-8"
                data-sidebar-search
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                <Command className="h-3 w-3 inline mr-1" />K
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="flex-1">
          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found</p>
              <p className="text-xs mt-1">Try adjusting your search</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <SidebarGroup key={group.title}>
                {state !== "collapsed" && (
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(item.path)}
                              onClick={() => handleNavigation(item)}
                            >
                              <Link to={item.path}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>

                                {/* Live indicator for preview page */}
                                {item.showLiveIndicator && isStreaming && (
                                  <SidebarMenuBadge className="bg-red-500 text-white">
                                    <Circle className="h-2 w-2 fill-current mr-1" />
                                    LIVE
                                  </SidebarMenuBadge>
                                )}

                                {/* Regular badges */}
                                {item.badge && !item.showLiveIndicator && (
                                  <SidebarMenuBadge>
                                    {item.badge}
                                  </SidebarMenuBadge>
                                )}

                                {/* Keyboard shortcut hint */}
                                {state !== "collapsed" && item.shortcut && (
                                  <div className="ml-auto text-xs text-muted-foreground">
                                    ⌘{item.shortcut}
                                  </div>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {state === "collapsed" && (
                            <TooltipContent side="right">
                              {item.description}
                              {item.shortcut && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Shortcut: ⌘{item.shortcut}
                                </div>
                              )}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          )}
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild>
                    <a
                      href="/help"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackUIInteraction("help_click", "click", {
                          page: location.pathname,
                        })
                      }
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Help & Support</span>
                    </a>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {state === "collapsed" && (
                  <TooltipContent side="right">Help & Support</TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => setShowKeyboardShortcuts(true)}
                    className="text-muted-foreground"
                  >
                    <Keyboard className="h-4 w-4" />
                    <span>Keyboard Shortcuts</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {state === "collapsed" && (
                  <TooltipContent side="right">
                    Keyboard Shortcuts
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={logout}
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {state === "collapsed" && (
                  <TooltipContent side="right">Logout</TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKeyboardShortcuts(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Search</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <kbd className="px-2 py-1 bg-muted rounded">⌘</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded">K</kbd>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Navigation</p>
                {navigationGroups
                  .flatMap((group) => group.items)
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{item.label}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <kbd className="px-2 py-1 bg-muted rounded">⌘</kbd>
                        <kbd className="px-2 py-1 bg-muted rounded">
                          {index + 1}
                        </kbd>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Close</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardSidebar;
