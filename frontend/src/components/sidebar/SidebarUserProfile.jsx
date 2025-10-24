import { useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Circle, Users } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

function SidebarUserProfile({ streamInfo }) {
  const { user } = useAuth();
  const { state } = useSidebar();

  const isStreaming = useMemo(
    () => streamInfo?.sources?.some((source) => source.isActive),
    [streamInfo]
  );

  const viewerCount = useMemo(
    () => streamInfo?.totalViewers || 0,
    [streamInfo]
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

  return (
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
  );
}

export default SidebarUserProfile;