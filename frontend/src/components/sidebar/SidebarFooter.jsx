import {
  SidebarFooter as SidebarFooterUI,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, LogOut, Keyboard } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { usePostHog } from "@/hooks/usePostHog";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

function SidebarFooter({ onShowKeyboardShortcuts }) {
  const { state } = useSidebar();
  const { trackUIInteraction } = usePostHog();
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <SidebarFooterUI className="border-t p-4">
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
                onClick={onShowKeyboardShortcuts}
                className="text-muted-foreground"
              >
                <Keyboard className="h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </SidebarMenuButton>
            </TooltipTrigger>
            {state === "collapsed" && (
              <TooltipContent side="right">Keyboard Shortcuts</TooltipContent>
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
    </SidebarFooterUI>
  );
}

export default SidebarFooter;