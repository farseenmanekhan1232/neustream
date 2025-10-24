import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import apiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { usePostHog } from "@/hooks/usePostHog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import SidebarUserProfile from "./SidebarUserProfile";
import SidebarSearch from "./SidebarSearch";
import SidebarNavigation from "./SidebarNavigation";
import SidebarFooter from "./SidebarFooter";
import SidebarKeyboardShortcuts from "./SidebarKeyboardShortcuts";

function DashboardSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { trackUIInteraction } = usePostHog();
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Fetch streaming status for live indicators
  const { data: streamInfo } = useQuery({
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
        const allItems = [
          { id: "overview", path: "/dashboard" },
          { id: "streaming", path: "/dashboard/streaming" },
          { id: "preview", path: "/dashboard/preview" },
          { id: "subscription", path: "/dashboard/subscription" },
          { id: "analytics", path: "/dashboard/analytics" },
          { id: "settings", path: "/dashboard/settings" },
        ];
        const targetItem = allItems[shortcutIndex];
        if (targetItem) {
          trackUIInteraction(`nav_${targetItem.id}_shortcut`, "keyboard", {
            shortcut: e.key,
            from_page: location.pathname,
            to_page: targetItem.path,
          });
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
  }, [trackUIInteraction, location.pathname]);

  const handleShowKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(true);
  };

  const handleCloseKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(false);
  };

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4">
          <SidebarUserProfile streamInfo={streamInfo} />
          <SidebarSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <SidebarNavigation
            searchQuery={searchQuery}
            isStreaming={streamInfo?.sources?.some((source) => source.isActive)}
          />
        </SidebarContent>

        <SidebarFooter onShowKeyboardShortcuts={handleShowKeyboardShortcuts} />

        <SidebarRail />
      </Sidebar>

      <SidebarKeyboardShortcuts
        show={showKeyboardShortcuts}
        onClose={handleCloseKeyboardShortcuts}
      />
    </>
  );
}

export default DashboardSidebar;