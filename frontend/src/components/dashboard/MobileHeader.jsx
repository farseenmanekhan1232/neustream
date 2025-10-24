import { memo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePostHog } from "@/hooks/usePostHog";
import { getPageTitle } from "@/constants/navigation";

const MobileHeader = memo(function MobileHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const { trackUIInteraction } = usePostHog();

  const pageTitle = getPageTitle(location.pathname);

  const handleNotificationClick = () => {
    trackUIInteraction("notifications_click", "click", {
      page: location.pathname
    });
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNotificationClick}
          aria-label="Notifications"
          className="h-8 w-8"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <Avatar className="h-8 w-8">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.email}
              className="rounded-full"
            />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getUserInitials()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  );
});

export default MobileHeader;