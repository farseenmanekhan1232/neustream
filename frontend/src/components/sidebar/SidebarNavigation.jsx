import { Link, useLocation } from "react-router-dom";
import { useMemo, useCallback } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Circle, LayoutDashboard, MonitorSpeaker, Radio, Crown, BarChart3, Settings } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { usePostHog } from "@/hooks/usePostHog";

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

function SidebarNavigation({ searchQuery, isStreaming }) {
  const location = useLocation();
  const { state } = useSidebar();
  const { trackUIInteraction } = usePostHog();

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

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

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

  if (filteredGroups.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="h-8 w-8 mx-auto mb-2 opacity-50">
          {/* Search icon placeholder */}
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm">No results found</p>
        <p className="text-xs mt-1">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <>
      {filteredGroups.map((group) => (
        <SidebarGroup key={group.title}>
          {state !== "collapsed" && (
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const IconComponent = item.icon;

                return (
                  <SidebarMenuItem key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.path)}
                          onClick={() => handleNavigation(item)}
                        >
                          <Link to={item.path}>
                            <IconComponent className="h-4 w-4" />
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

export default SidebarNavigation;