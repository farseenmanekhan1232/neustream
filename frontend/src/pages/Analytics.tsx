import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your stream performance and viewer engagement
        </p>
      </div>

      {/* Coming Soon State */}
      <div className="text-center py-12">
        <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Analytics Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're working on powerful analytics tools to help you understand your
          audience and grow your streams.
        </p>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Viewer Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track viewer count, peak times, and demographics
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor stream quality, bitrate, and connection stability
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyze chat activity, reactions, and interaction rates
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
