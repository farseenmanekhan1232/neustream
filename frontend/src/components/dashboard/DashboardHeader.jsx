import { memo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Bell, Menu, PanelLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePostHog } from "@/hooks/usePostHog";
import { getPageTitle, getPageDescription } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const DashboardHeader = memo(function DashboardHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const { trackUIInteraction } = usePostHog();
  const { _, isMobile } = useSidebar();

  const pageTitle = getPageTitle(location.pathname);
  const pageDescription = getPageDescription(location.pathname);

  const handleNotificationClick = () => {
    trackUIInteraction("notifications_click", "click", {
      page: location.pathname,
    });
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  // Unified header that works for both mobile and desktop
  return (
    <header
      className={cn(
        "flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "relative z-10" // Ensure proper stacking context
      )}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <SidebarTrigger className="md:hidden">
          {isMobile ? (
            <Menu className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </SidebarTrigger>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "font-semibold truncate",
              isMobile ? "text-lg" : "text-2xl"
            )}
          >
            {pageTitle}
          </div>
          {!isMobile && (
            <p className="text-sm text-muted-foreground truncate">
              {pageDescription}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNotificationClick}
          aria-label="Notifications"
          className={cn("h-8 w-8 md:h-10 md:w-10")}
        >
          <Bell className={cn("h-4 w-4 md:h-5 md:w-5")} />
        </Button>

        <Avatar className={cn("h-8 w-8 md:h-10 md:w-10")}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.email}
              className="rounded-full"
            />
          ) : (
            <AvatarFallback
              className={cn(
                "bg-primary/10 text-primary",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {getUserInitials()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  );
});

export default DashboardHeader;
