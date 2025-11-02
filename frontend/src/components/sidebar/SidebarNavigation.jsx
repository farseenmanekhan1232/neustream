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
import { Circle } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { usePostHog } from "@/hooks/usePostHog";
import { SIDEBAR_NAVIGATION_GROUPS } from "@/config/routes";

function SidebarNavigation({ searchQuery, isStreaming }) {
  const location = useLocation();
  const { state } = useSidebar();
  const { trackUIInteraction } = usePostHog();

  // Filter navigation items based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return SIDEBAR_NAVIGATION_GROUPS;

    const query = searchQuery.toLowerCase();
    return SIDEBAR_NAVIGATION_GROUPS
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.keywords && item.keywords.some((keyword) =>
              keyword.toLowerCase().includes(query)
            ))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const handleNavigation = useCallback(
    (item) => {
      const itemId = item.path.split('/').pop() || 'overview';
      trackUIInteraction(`nav_${itemId}`, "click", {
        from_page: location.pathname,
        to_page: item.path,
        item_label: item.title,
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
              {group.items.map((item, index) => {
                const IconComponent = item.icon;
                const itemId = item.path.split('/').pop() || 'overview';

                return (
                  <SidebarMenuItem key={itemId}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.path)}
                          onClick={() => handleNavigation(item)}
                        >
                          <Link to={item.path}>
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            <span>{item.title}</span>

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