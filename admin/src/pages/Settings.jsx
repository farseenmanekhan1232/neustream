"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Shield,
  Database,
  Bell,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showApiKeys, setShowApiKeys] = useState({});
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    streamNotifications: true,
    systemAlerts: false,
    weeklyReports: true,
  });

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const ProfileSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            {user?.avatar_url ? (
              <img
                className="h-16 w-16 rounded-full"
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.displayName || user.email}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xl font-medium text-muted-foreground">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h4 className="text-lg font-medium">
                {user?.displayName || "Admin User"}
              </h4>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="bg-success/10 text-success">
                Administrator
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                defaultValue={user?.displayName || ""}
                disabled
                className="bg-muted"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Managed through OAuth provider
              </p>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Managed through OAuth provider
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OAuth Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Authentication Method</p>
              <p className="text-sm text-muted-foreground">
                You are authenticated via {user?.oauthProvider || "email"}
              </p>
            </div>
            <Badge
              variant={
                user?.oauthProvider === "google"
                  ? "default"
                  : user?.oauthProvider === "twitch"
                  ? "secondary"
                  : "outline"
              }
            >
              {user?.oauthProvider?.charAt(0).toUpperCase() +
                user?.oauthProvider?.slice(1) || "Email"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiUrl">Control Plane API URL</Label>
            <Input
              id="apiUrl"
              type="url"
              defaultValue={
                import.meta.env.VITE_API_URL || "http://localhost:3000"
              }
              placeholder="https://api.neustream.app"
            />
          </div>
          <div>
            <Label htmlFor="posthogKey">PostHog API Key</Label>
            <div className="relative">
              <Input
                id="posthogKey"
                type={showApiKeys.posthog ? "text" : "password"}
                defaultValue="phc_..." // Would come from environment
                placeholder="Your PostHog API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() =>
                  setShowApiKeys((prev) => ({
                    ...prev,
                    posthog: !prev.posthog,
                  }))
                }
              >
                {showApiKeys.posthog ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Session</p>
              <p className="text-sm text-muted-foreground">
                Logged in as {user?.email}
              </p>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Token
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SystemSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Database Type
              </dt>
              <dd className="mt-1 text-sm">PostgreSQL</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Environment
              </dt>
              <dd className="mt-1 text-sm">
                {import.meta.env.MODE || "development"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                API Version
              </dt>
              <dd className="mt-1 text-sm">v1.0.0</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Last Deployment
              </dt>
              <dd className="mt-1 text-sm">Unknown</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium">API Server</span>
              </div>
              <Badge variant="default" className="bg-success/10 text-success">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge variant="default" className="bg-success/10 text-success">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-warning rounded-full"></div>
                <span className="text-sm font-medium">Analytics</span>
              </div>
              <Badge variant="secondary" className="bg-warning/10 text-warning">
                Limited Data
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "emailAlerts",
              label: "Email Alerts",
              description:
                "Receive email notifications for important system events",
            },
            {
              key: "streamNotifications",
              label: "Stream Notifications",
              description: "Get notified when users start/stop streaming",
            },
            {
              key: "systemAlerts",
              label: "System Alerts",
              description: "Critical system errors and downtime notifications",
            },
            {
              key: "weeklyReports",
              label: "Weekly Reports",
              description: "Receive weekly usage and performance summaries",
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNotificationChange(key)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full p-0",
                  notifications[key] ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-background transition-transform",
                    notifications[key] ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
