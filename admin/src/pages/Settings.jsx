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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const NotificationSettingsRow = ({ key, label, description, enabled }) => (
    <TableRow>
      <TableCell>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNotificationChange(key)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full p-0",
            enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-background transition-transform",
              enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </Button>
      </TableCell>
    </TableRow>
  );

  const SystemInfoRow = ({ label, value }) => (
    <TableRow>
      <TableCell className="font-medium text-muted-foreground">
        {label}
      </TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );

  const SystemHealthRow = ({ service, status, badgeVariant, badgeClass }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${status}`}></div>
          <span className="text-sm font-medium">{service}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant={badgeVariant} className={badgeClass}>
          {service === "API Server"
            ? "Operational"
            : service === "Database"
            ? "Connected"
            : "Limited Data"}
        </Badge>
      </TableCell>
    </TableRow>
  );

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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setting</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SystemInfoRow label="Database Type" value="PostgreSQL" />
              <SystemInfoRow
                label="Environment"
                value={import.meta.env.MODE || "development"}
              />
              <SystemInfoRow label="API Version" value="v1.0.0" />
              <SystemInfoRow label="Last Deployment" value="Unknown" />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SystemHealthRow
                service="API Server"
                status="bg-success"
                badgeVariant="default"
                badgeClass="bg-success/10 text-success"
              />
              <SystemHealthRow
                service="Database"
                status="bg-success"
                badgeVariant="default"
                badgeClass="bg-success/10 text-success"
              />
              <SystemHealthRow
                service="Analytics"
                status="bg-warning"
                badgeVariant="secondary"
                badgeClass="bg-warning/10 text-warning"
              />
            </TableBody>
          </Table>
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead className="text-right">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <NotificationSettingsRow
                key="emailAlerts"
                label="Email Alerts"
                description="Receive email notifications for important system events"
                enabled={notifications.emailAlerts}
              />
              <NotificationSettingsRow
                key="streamNotifications"
                label="Stream Notifications"
                description="Get notified when users start/stop streaming"
                enabled={notifications.streamNotifications}
              />
              <NotificationSettingsRow
                key="systemAlerts"
                label="System Alerts"
                description="Critical system errors and downtime notifications"
                enabled={notifications.systemAlerts}
              />
              <NotificationSettingsRow
                key="weeklyReports"
                label="Weekly Reports"
                description="Receive weekly usage and performance summaries"
                enabled={notifications.weeklyReports}
              />
            </TableBody>
          </Table>
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
        <div className="text-2xl font-bold text-foreground">Settings</div>
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
