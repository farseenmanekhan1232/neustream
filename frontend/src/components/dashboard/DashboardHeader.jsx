import { memo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, PanelLeft, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePostHog } from "@/hooks/usePostHog";
import { getPageTitle, getPageDescription } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const DashboardHeader = memo(function DashboardHeader() {
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    trackUIInteraction("user_logout", "click", {
      page: location.pathname,
    });
    logout();
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
        <SidebarTrigger className="">
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
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNotificationClick}
          aria-label="Notifications"
          className={cn("h-8 w-8 md:h-10 md:w-10")}
        >
          <Bell className={cn("h-4 w-4 md:h-5 md:w-5")} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 md:h-10 md:w-10 rounded-full p-0"
              aria-label="User menu"
            >
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

export default DashboardHeader;
