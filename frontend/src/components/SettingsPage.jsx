import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Shield, Bell, Key, Globe, Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import TOTPSettings from "@/components/TOTPSettings";

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
          <CardDescription>Your basic account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            {user?.avatarUrl ? (
              <img
                className="h-16 w-16 rounded-full"
                src={user.avatarUrl || "/placeholder.svg"}
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
              <h4 className="text-lg font-medium">{user?.displayName || "User"}</h4>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-1">
                {user?.oauthProvider?.charAt(0).toUpperCase() + user?.oauthProvider?.slice(1) || "Email"} Account
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
                Managed through your authentication provider
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
                Managed through your authentication provider
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Additional account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>User ID</Label>
            <div className="flex items-center gap-2">
              <Input value={user?.id} disabled className="bg-muted font-mono text-sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(user?.id)}
              >
                <Key className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Account Created</Label>
            <Input
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              disabled
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <TOTPSettings />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>API settings for integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiUrl">Control Plane API URL</Label>
            <Input
              id="apiUrl"
              type="url"
              defaultValue={import.meta.env.VITE_API_URL || "https://api.neustream.app"}
              placeholder="https://api.neustream.app"
              disabled
              className="bg-muted"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              The API endpoint for your streaming configuration
            </p>
          </div>
          <div>
            <Label htmlFor="streamUrl">Stream URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="streamUrl"
                type="text"
                value={`rtmp://stream.neustream.app/live/${user?.streamKey || 'your-stream-key'}`}
                disabled
                className="bg-muted font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(`rtmp://stream.neustream.app/live/${user?.streamKey}`)}
              >
                <Key className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Your RTMP streaming URL for OBS or similar software
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Control how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Alerts</p>
              <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
            </div>
            <Button
              variant={notifications.emailAlerts ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationChange('emailAlerts')}
            >
              {notifications.emailAlerts ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Stream Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified when you start/stop streaming</p>
            </div>
            <Button
              variant={notifications.streamNotifications ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationChange('streamNotifications')}
            >
              {notifications.streamNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Alerts</p>
              <p className="text-sm text-muted-foreground">Critical system errors and downtime notifications</p>
            </div>
            <Button
              variant={notifications.systemAlerts ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationChange('systemAlerts')}
            >
              {notifications.systemAlerts ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Weekly streaming summary and analytics</p>
            </div>
            <Button
              variant={notifications.weeklyReports ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationChange('weeklyReports')}
            >
              {notifications.weeklyReports ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full px-6 py-6 space-y-6 mx-auto max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
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

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;