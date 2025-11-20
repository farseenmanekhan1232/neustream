"use client";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart3,
  Users,
  Activity,
  Settings,
  LogOut,
  Shield,
  Radio,
  Target,
  TrendingUp,
  Crown,
  CreditCard,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Users", href: "/users", icon: Users },
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "Subscription Plans", href: "/subscription-plans", icon: Crown },
    { name: "User Subscriptions", href: "/user-subscriptions", icon: CreditCard },
    { name: "Sources", href: "/sources", icon: Radio },
    { name: "Destinations", href: "/destinations", icon: Target },
    { name: "Streams", href: "/streams", icon: Activity },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 glass border-r transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
              <Shield className="h-7 w-7 text-primary flex-shrink-0" />
              {!isCollapsed && (
                <div>
                  <div className="text-lg font-semibold text-card-foreground">
                    Neustream
                  </div>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full transition-smooth",
                    isCollapsed ? "justify-center px-0" : "justify-start",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Link to={item.href} className="flex items-center gap-3 w-full">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Collapse Button (when collapsed) */}
          {isCollapsed && (
            <div className="p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="w-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* User section */}
          <div className="border-t p-3">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-card-foreground">
                      {user?.displayName || "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex-shrink-0 p-1 h-8 w-8"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", isCollapsed ? "pl-20" : "pl-64")}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 glass border-b">
          <div className="flex h-16 items-center justify-between px-8">
            <h2 className="text-xl font-semibold text-card-foreground">
              {navigation.find((nav) => nav.href === location.pathname)?.name ||
                "Dashboard"}
            </h2>

            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-success/10 text-success border-success/20 shadow-none"
              >
                <div className="h-2 w-2 bg-success rounded-full mr-2 animate-pulse"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-8 max-w-screen-2xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

