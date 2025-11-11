import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and configuration
        </p>
      </div>

      {/* Coming Soon State */}
      <div className="text-center py-12">
        <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <SettingsIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Settings Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're building comprehensive settings to help you customize your
          streaming experience.
        </p>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your profile information and avatar
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure email and push notifications
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage privacy and security settings
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customize themes and display preferences
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
