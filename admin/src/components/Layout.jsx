"use client";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Users", href: "/users", icon: Users },
    { name: "Sources", href: "/sources", icon: Radio },
    { name: "Destinations", href: "/destinations", icon: Target },
    { name: "Streams", href: "/streams", icon: Activity },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg border-r">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-card-foreground">
                  Neustream
                </h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Link to={item.href} className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-card shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-card-foreground">
              {navigation.find((nav) => nav.href === location.pathname)?.name ||
                "Dashboard"}
            </h2>

            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-success/10 text-success border-success/20"
              >
                <div className="h-2 w-2 bg-success rounded-full mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
