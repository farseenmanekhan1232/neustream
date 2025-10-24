import { memo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePostHog } from "@/hooks/usePostHog";
import { getPageTitle, getPageDescription } from "@/constants/navigation";
import MobileHeader from "./MobileHeader";

const DashboardHeader = memo(function DashboardHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const { trackUIInteraction } = usePostHog();

  const pageTitle = getPageTitle(location.pathname);
  const pageDescription = getPageDescription(location.pathname);

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
    <>
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-semibold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {pageDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotificationClick}
            aria-label="Notifications"
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
                {getUserInitials()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </header>
    </>
  );
});

export default DashboardHeader;