import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import {
  Moon,
  Sun,
  Laptop,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and configuration.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your public profile details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium">{user?.displayName || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={user?.displayName || ""}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Display name cannot be changed at this time.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>
              
              {user?.oauthProvider && (
                 <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>
                      Signed in via <strong>{user.oauthProvider}</strong>. Security settings are managed by your provider.
                    </span>
                 </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Neustream looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div 
                  className={cn(
                    "space-y-2 cursor-pointer group",
                    theme === "light" && "text-primary"
                  )}
                  onClick={() => setTheme("light")}
                >
                  <div className={cn(
                    "h-24 rounded-lg border-2 bg-background p-2 transition-all",
                    theme === "light" ? "border-primary" : "border-muted group-hover:border-primary/50"
                  )}>
                    <div className="h-full w-full rounded bg-muted/20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span className="text-sm font-medium">Light</span>
                  </div>
                </div>
                <div 
                  className={cn(
                    "space-y-2 cursor-pointer group",
                    theme === "dark" && "text-primary"
                  )}
                  onClick={() => setTheme("dark")}
                >
                  <div className={cn(
                    "h-24 rounded-lg border-2 bg-background p-2 transition-all",
                    theme === "dark" ? "border-primary" : "border-muted group-hover:border-primary/50"
                  )}>
                    <div className="h-full w-full rounded bg-slate-950" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                </div>
                <div 
                  className={cn(
                    "space-y-2 cursor-pointer group",
                    theme === "system" && "text-primary"
                  )}
                  onClick={() => setTheme("system")}
                >
                  <div className={cn(
                    "h-24 rounded-lg border-2 bg-background p-2 transition-all",
                    theme === "system" ? "border-primary" : "border-muted group-hover:border-primary/50"
                  )}>
                    <div className="h-full w-full rounded bg-gradient-to-br from-muted/20 to-slate-950" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" />
                    <span className="text-sm font-medium">System</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
