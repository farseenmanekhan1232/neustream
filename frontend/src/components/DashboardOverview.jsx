import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Radio,
  Play,
  Clock,
  TrendingUp,
  Users,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Settings,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardOverviewSkeleton } from "@/components/LoadingSkeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePostHog } from "../hooks/usePostHog";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function DashboardOverview({ user }) {
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [streamDuration, setStreamDuration] = useState(0);
  const { trackUIInteraction, trackStreamEvent } = usePostHog();

  // Add early return if user is not available
  if (!user) {
    return <DashboardOverviewSkeleton />;
  }

  // Fetch stream info
  const { data: streamInfo, isLoading: streamLoading } = useQuery({
    queryKey: ["streamInfo", user.id],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/streams/info?userId=${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch stream info");
      return response.json();
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    enabled: !!user, // Only run query when user is available
  });

  // Fetch destinations
  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ["destinations", user.id],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/destinations?userId=${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch destinations");
      return response.json();
    },
    enabled: !!user, // Only run query when user is available
  });

  const destinations = destinationsData?.destinations || [];
  const isNewUser = destinations.length === 0;

  // Copy to clipboard function
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      // Track copy actions
      trackUIInteraction(`copy_${field.toLowerCase().replace(/\s+/g, '_')}`, "click", {
        field_type: field,
        content_length: text.length,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Update stream duration
  useEffect(() => {
    if (streamInfo?.isActive && streamInfo?.activeStream?.started_at) {
      const startTime = new Date(streamInfo.activeStream.started_at).getTime();
      const updateDuration = () => {
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        setStreamDuration(duration);
      };

      updateDuration();
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    } else {
      setStreamDuration(0);
    }
  }, [streamInfo?.isActive, streamInfo?.activeStream?.started_at]);

  if (streamLoading || destinationsLoading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl max-sm:text-xl">
            {isNewUser
              ? `Welcome to NeuStream, ${user.email?.split("@")[0]}!`
              : `Welcome back, ${user.email?.split("@")[0]}!`}
          </CardTitle>
          <CardDescription>
            {isNewUser
              ? "Let's get you set up for multi-platform streaming in just a few steps."
              : "Your streaming setup is ready. Check your stats and manage your destinations below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isNewUser ? (
            <div className="flex max-md:flex-col gap-2 items-center space-x-4">
              <Button asChild>
                <Link to="/dashboard/destinations">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Destination
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="/help" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  View Setup Guide
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Radio className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {destinations.length} Destinations
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active platforms
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    streamInfo?.isActive ? "bg-green-500/20" : "bg-gray-500/20"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      streamInfo?.isActive
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {streamInfo?.isActive ? "Live Now" : "Offline"}
                  </p>
                  <p className="text-xs text-muted-foreground">Stream status</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {streamInfo?.isActive
                      ? formatDuration(streamDuration)
                      : "--:--:--"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stream duration
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <Radio className="h-5 w-5 mr-2 text-primary" />
                Manage Destinations
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Add or configure your streaming platforms like YouTube, Twitch,
              and Facebook.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Stream Setup
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get your RTMP URL and stream key for OBS Studio or other streaming
              software.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer group opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                View Analytics
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Track your stream performance and viewer engagement across all
              platforms.
            </CardDescription>
            <Badge variant="secondary" className="mt-2">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Stream Configuration */}
      {streamInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Stream Configuration</CardTitle>
            <CardDescription>
              Use these settings to configure your streaming software
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Stream Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>Stream Key</span>
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                </label>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md font-mono text-sm border">
                    <span className="break-all text-xs sm:text-sm">
                      {showStreamKey ? streamInfo.streamKey : "•".repeat(32)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      className="flex-shrink-0"
                    >
                      {showStreamKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(streamInfo.streamKey, "Stream Key")
                      }
                      className="flex-shrink-0"
                    >
                      {copiedField === "Stream Key" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* RTMP URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>RTMP URL</span>
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                </label>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md font-mono text-sm border">
                    <span className="break-all text-xs sm:text-sm">
                      {streamInfo.rtmpUrl}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(streamInfo.rtmpUrl, "RTMP URL")
                      }
                      className="flex-shrink-0"
                    >
                      {copiedField === "RTMP URL" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {streamInfo?.isActive && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Play className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">
                      You're currently streaming!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Duration: {formatDuration(streamDuration)} • Stream is
                      being forwarded to all active destinations
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Destinations */}
      {!isNewUser && destinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Active Destinations</span>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/dashboard/destinations"
                  className="flex items-center"
                >
                  Manage All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {destinations.slice(0, 3).map((destination) => {
                const platformIcons = {
                  youtube: () => (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      YT
                    </div>
                  ),
                  twitch: () => (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      TW
                    </div>
                  ),
                  facebook: () => (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      FB
                    </div>
                  ),
                  custom: () => (
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      RTMP
                    </div>
                  ),
                };

                const PlatformIcon =
                  platformIcons[destination.platform] || platformIcons.custom;

                return (
                  <div
                    key={destination.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <PlatformIcon />
                      <div>
                        <p className="font-medium capitalize">
                          {destination.platform}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono truncate">
                          {destination.rtmp_url}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={destination.is_active ? "default" : "secondary"}
                    >
                      {destination.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                );
              })}
              {destinations.length > 3 && (
                <Button variant="ghost" className="w-full" asChild>
                  <Link
                    to="/dashboard/destinations"
                    className="flex items-center justify-center"
                  >
                    View {destinations.length - 3} more destinations
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Progress for New Users */}
      {isNewUser && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Setup Progress</CardTitle>
            <CardDescription>
              Complete these steps to start streaming
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: "Add streaming destinations",
                  description: "Connect YouTube, Twitch, Facebook, etc.",
                  completed: false,
                },
                {
                  step: 2,
                  title: "Configure OBS Studio",
                  description: "Set up your streaming software",
                  completed: false,
                },
                {
                  step: 3,
                  title: "Start streaming",
                  description: "Go live to all your platforms",
                  completed: false,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    item.completed
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.completed
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.completed ? "✓" : item.step}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        item.completed
                          ? "text-green-700 dark:text-green-300"
                          : ""
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" asChild>
              <Link to="/dashboard/destinations">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DashboardOverview;
