import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Settings,
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";

function DashboardSidebar({ user, isCollapsed, setIsCollapsed }) {
  const { logout } = useAuth();
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "destinations",
      label: "Destinations",
      icon: Radio,
      path: "/dashboard/destinations",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/dashboard/analytics",
      badge: "Soon",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  return (
    <div
      className={`flex flex-col h-full bg-card border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground">Streamer</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={`w-full justify-start ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>

        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <a href="/help" target="_blank" rel="noopener noreferrer">
              <HelpCircle className="h-4 w-4" />
              <span className="ml-2">Help & Support</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default DashboardSidebar;
