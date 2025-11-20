import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService } from "@/services/subscription";
import {
  LayoutDashboard,
  Radio,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Streaming",
    url: "/dashboard/streaming",
    icon: Radio,
  },
  {
    title: "Subscription",
    url: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

const secondaryNavItems = [
  {
    title: "Help & Support",
    url: "/help",
    icon: HelpCircle,
  },
];

function NavItem({ item, isActive, isCollapsed }: { item: any; isActive: boolean; isCollapsed: boolean }) {
  return (
    <Button
      variant="ghost"
      size={isCollapsed ? "icon" : "sm"}
      className={cn(
        "w-full justify-start gap-3 transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        isCollapsed && "justify-center px-2"
      )}
      asChild
    >
      <Link to={item.url} title={isCollapsed ? item.title : undefined}>
        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
        {!isCollapsed && <span className="font-medium">{item.title}</span>}
        {isActive && !isCollapsed && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </Link>
    </Button>
  );
}

function UserMenu({ user, logout, isCollapsed }: { user: any; logout: () => void; isCollapsed: boolean }) {
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 p-2 h-auto hover:bg-muted/50",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">
                {user?.displayName || "User"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={8}>
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
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3 bg-muted/50" />
        <Skeleton className="h-4 w-2/3 bg-muted/30" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Fetch subscription data to check plan
  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      return await subscriptionService.getMySubscription();
    },
    enabled: !!user,
  });

  const isFreeplan = subscriptionData?.subscription?.plan_name?.toLowerCase() === "free";

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Simulate loading on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 lg:static",
          isSidebarOpen ? "w-64" : "w-20",
          !isMobileMenuOpen && "lg:flex hidden"
        )}
        animate={{
          width: isSidebarOpen ? 256 : 80,
          x: isMobileMenuOpen ? 0 : 0,
        }}
      >
        {/* Logo Area */}
        <div className={cn("flex h-16 items-center border-b border-border/40", isSidebarOpen ? "px-6" : "justify-center")}>
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <img src="logo.png"/>
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-lg tracking-tight"
              >
                neustream.
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.url}
                item={item}
                isActive={location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url))}
                isCollapsed={!isSidebarOpen}
              />
            ))}
          </div>

          {/* Pro Plan Upgrade Card - Free Users Only */}
          {isFreeplan && isSidebarOpen && (
            <Link to="/dashboard/subscription" className="block">
              <div className="mx-2 p-3 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-200 group">
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[10px] h-4">
                    Pro
                  </Badge>
                  <Sparkles className="h-3 w-3 text-primary/70 shrink-0 mt-0.5" />
                </div>
                <p className="text-xs font-medium text-foreground mb-1">Upgrade for Unlimited</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                  Stream hours & destinations
                </p>
                <div className="flex items-center gap-1 text-[10px] font-medium text-primary group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}

          <Separator className="bg-border/40" />

          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem
                key={item.url}
                item={item}
                isActive={location.pathname === item.url}
                isCollapsed={!isSidebarOpen}
              />
            ))}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-border/40">
          <UserMenu user={user} logout={logout} isCollapsed={!isSidebarOpen} />
        </div>
      </motion.aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border/40 bg-background lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-border/40">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg tracking-tight">neustream.</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.url}
                    item={item}
                    isActive={location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url))}
                    isCollapsed={false}
                  />
                ))}
              </div>
              <Separator className="bg-border/40" />
              <div className="space-y-1">
                {secondaryNavItems.map((item) => (
                  <NavItem
                    key={item.url}
                    item={item}
                    isActive={location.pathname === item.url}
                    isCollapsed={false}
                  />
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-border/40">
              <UserMenu user={user} logout={logout} isCollapsed={false} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-muted-foreground hover:text-foreground"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <Menu className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
            
            {/* Breadcrumbs / Page Title */}
            <div className="hidden md:flex items-center text-sm text-muted-foreground">
               <span className="hover:text-foreground transition-colors cursor-default">Dashboard</span>
               {location.pathname !== "/dashboard" && (
                 <>
                   <ChevronRight className="h-4 w-4 mx-2" />
                   <span className="font-medium text-foreground capitalize">
                     {location.pathname.split("/").pop()?.replace("-", " ")}
                   </span>
                 </>
               )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-medium">System Operational</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {isLoading ? (
            <PageSkeleton />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
