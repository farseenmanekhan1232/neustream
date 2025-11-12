"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  TrendingUp,
  Users,
  Activity,
  Target,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AnalyticsPage = () => {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [streamAnalytics, setStreamAnalytics] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const UserRegistrationTrendRow = ({ trend }) => (
    <TableRow>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(trend.date)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">Total: {trend.registrations}</Badge>
          <Badge variant="outline">Google: {trend.google_registrations}</Badge>
          <Badge variant="outline">Twitch: {trend.twitch_registrations}</Badge>
          <Badge variant="outline">Email: {trend.email_registrations}</Badge>
        </div>
      </TableCell>
    </TableRow>
  );

  const PlatformAnalyticsRow = ({ platform }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center">
          <span className="text-xl mr-3">
            {getPlatformIcon(platform.platform)}
          </span>
          <span className="font-medium capitalize">{platform.platform}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {platform.total_destinations} destinations
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-medium text-success">
          {platform.active_destinations}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-medium">{platform.unique_sources}</span>
      </TableCell>
      <TableCell>
        <span className="font-medium">{platform.unique_users}</span>
      </TableCell>
    </TableRow>
  );

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load all analytics data in parallel
      const [userStats, streamStats, systemData] = await Promise.all([
        adminApi.getUserAnalytics(period),
        adminApi.getStreamAnalytics(period),
        adminApi.getStats(),
      ]);

      setUserAnalytics(userStats);
      setStreamAnalytics(streamStats);
      setSystemStats(systemData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // const formatNumber = (num) => {
  //   if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  //   if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  //   return num.toString();
  // };

  const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return "🎥";
      case "twitch":
        return "📺";
      case "facebook":
        return "📘";
      case "instagram":
        return "📷";
      case "linkedin":
        return "💼";
      case "twitter":
        return "🐦";
      default:
        return "📡";
    }
  };

  // const getGrowthRate = (current, previous) => {
  //   if (!previous || previous === 0) return 0;
  //   return ((current - previous) / previous * 100).toFixed(1);
  // };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-normal text-gray-900">Analytics</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-normal text-foreground">
            Analytics Dashboard
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Comprehensive insights into your streaming platform performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="streams" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Stream Analytics
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Platform Stats
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {systemStats && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-primary-foreground/80 text-sm">
                        Total Users
                      </p>
                      <p className="text-3xl font-normal text-foreground">
                        {systemStats.users?.total_users || 0}
                      </p>
                      <p className="text-primary-foreground/80 text-xs mt-1">
                        +{systemStats.users?.new_users_week || 0} this week
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-primary-foreground/60" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-success to-success/80 text-success-foreground border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-success-foreground/80 text-sm">
                        Active Streams
                      </p>
                      <p className="text-3xl font-normal text-foreground">
                        {systemStats.streams?.activeStreams || 0}
                      </p>
                      <p className="text-success-foreground/80 text-xs mt-1">
                        {systemStats.streams?.total_sources || 0} total sources
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-success-foreground/60" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-primary-foreground/80 text-sm">
                        Total Destinations
                      </p>
                      <p className="text-3xl font-normal text-foreground">
                        {systemStats.destinations?.total_destinations || 0}
                      </p>
                      <p className="text-primary-foreground/80 text-xs mt-1">
                        Across all platforms
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-primary-foreground/60" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-warning-foreground/80 text-sm">
                        Recent Activity
                      </p>
                      <p className="text-3xl font-normal text-foreground">
                        {systemStats.activity?.streams_started_24h || 0}
                      </p>
                      <p className="text-warning-foreground/80 text-xs mt-1">
                        Streams in last 24h
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-warning-foreground/60" />
                  </CardContent>
                </Card>
              </div>

              {/* Platform Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {systemStats.destinations && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-3">🎥</span>
                            <span className="text-sm font-medium">YouTube</span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.destinations.youtube_dests || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-3">📺</span>
                            <span className="text-sm font-medium">Twitch</span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.destinations.twitch_dests || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-3">📘</span>
                            <span className="text-sm font-medium">
                              Facebook
                            </span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.destinations.facebook_dests || 0}
                          </Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {systemStats.users && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                            <span className="text-sm font-medium">Google</span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.users.google_users || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-primary/70 rounded-full mr-3"></div>
                            <span className="text-sm font-medium">Twitch</span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.users.twitch_users || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-muted-foreground rounded-full mr-3"></div>
                            <span className="text-sm font-medium">Email</span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.users.email_users || 0}
                          </Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-6">
          {userAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardDescription>Total Users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-normal">
                      {userAnalytics.activityMetrics?.total_users || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Active Users (Period)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-normal text-success">
                      {userAnalytics.activityMetrics?.active_users || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Active Today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-normal text-primary">
                      {userAnalytics.activityMetrics?.active_users_24h || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* User Registration Trends */}
              {userAnalytics.registrationTrends &&
                userAnalytics.registrationTrends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>User Registration Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Registration Breakdown</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userAnalytics.registrationTrends
                            .slice(-7)
                            .map((trend, index) => (
                              <UserRegistrationTrendRow
                                key={index}
                                trend={trend}
                              />
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>

        {/* Stream Analytics Tab */}
        <TabsContent value="streams" className="space-y-6">
          {streamAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardDescription>Total Sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-normal">
                      {streamAnalytics.qualityMetrics?.total_sessions || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Completed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-normal text-success">
                      {streamAnalytics.streamTrends?.reduce(
                        (acc, t) => acc + (t.streams_completed || 0),
                        0,
                      ) || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Avg Duration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-normal text-primary">
                      {formatDuration(
                        streamAnalytics.qualityMetrics?.avg_duration_seconds,
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Unique Streamers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-normal text-primary/70">
                      {streamAnalytics.streamTrends?.reduce(
                        (acc, t) => acc + (t.unique_streamers || 0),
                        0,
                      ) || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Stream Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Stream Duration Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-normal text-destructive">
                        {streamAnalytics.qualityMetrics?.under_1min || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Under 1 min
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-normal text-warning">
                        {streamAnalytics.qualityMetrics?.between_1_5min || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        1-5 min
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-normal text-primary">
                        {streamAnalytics.qualityMetrics?.between_5_30min || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        5-30 min
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-normal text-success">
                        {streamAnalytics.qualityMetrics?.over_30min || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Over 30 min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Platform Stats Tab */}
        <TabsContent value="platforms" className="space-y-6">
          {streamAnalytics && (
            <>
              {streamAnalytics.platformAnalytics &&
                streamAnalytics.platformAnalytics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Usage Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Platform</TableHead>
                            <TableHead>Total Destinations</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Sources</TableHead>
                            <TableHead>Users</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {streamAnalytics.platformAnalytics.map(
                            (platform, index) => (
                              <PlatformAnalyticsRow
                                key={index}
                                platform={platform}
                              />
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
