import React, { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  TrendingUp,
  Users,
  Activity,
  Target,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
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

  // const getGrowthRate = (current, previous) => {
  //   if (!previous || previous === 0) return 0;
  //   return ((current - previous) / previous * 100).toFixed(1);
  // };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
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
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold">
                        {systemStats.users?.total_users || 0}
                      </p>
                      <p className="text-blue-100 text-xs mt-1">
                        +{systemStats.users?.new_users_week || 0} this week
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-green-100 text-sm">Active Streams</p>
                      <p className="text-3xl font-bold">
                        {systemStats.streams?.activeStreams || 0}
                      </p>
                      <p className="text-green-100 text-xs mt-1">
                        {systemStats.streams?.total_sources || 0} total sources
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-200" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-purple-100 text-sm">
                        Total Destinations
                      </p>
                      <p className="text-3xl font-bold">
                        {systemStats.destinations?.total_destinations || 0}
                      </p>
                      <p className="text-purple-100 text-xs mt-1">
                        Across all platforms
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-purple-200" />
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-orange-100 text-sm">Recent Activity</p>
                      <p className="text-3xl font-bold">
                        {systemStats.activity?.streams_started_24h || 0}
                      </p>
                      <p className="text-orange-100 text-xs mt-1">
                        Streams in last 24h
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-200" />
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
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium">Google</span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.users.google_users || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium">Twitch</span>
                          </div>
                          <Badge variant="secondary">
                            {systemStats.users.twitch_users || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
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
                    <p className="text-2xl font-bold">
                      {userAnalytics.activityMetrics?.total_users || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Active Users (Period)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {userAnalytics.activityMetrics?.active_users || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Active Today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
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
                    <CardContent>
                      <div className="space-y-2">
                        {userAnalytics.registrationTrends
                          .slice(-7)
                          .map((trend, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 border-b border-muted last:border-0"
                            >
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(trend.date)}
                                </span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline">
                                    Total: {trend.registrations}
                                  </Badge>
                                  <Badge variant="outline">
                                    Google: {trend.google_registrations}
                                  </Badge>
                                  <Badge variant="outline">
                                    Twitch: {trend.twitch_registrations}
                                  </Badge>
                                  <Badge variant="outline">
                                    Email: {trend.email_registrations}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
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
                    <p className="text-2xl font-bold">
                      {streamAnalytics.qualityMetrics?.total_sessions || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Completed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {streamAnalytics.streamTrends?.reduce(
                        (acc, t) => acc + (t.streams_completed || 0),
                        0
                      ) || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Avg Duration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatDuration(
                        streamAnalytics.qualityMetrics?.avg_duration_seconds
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Unique Streamers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-600">
                      {streamAnalytics.streamTrends?.reduce(
                        (acc, t) => acc + (t.unique_streamers || 0),
                        0
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
                      <div className="text-2xl font-bold text-red-600">
                        {streamAnalytics.qualityMetrics?.under_1min || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Under 1 min
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {streamAnalytics.qualityMetrics?.between_1_5min || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        1-5 min
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {streamAnalytics.qualityMetrics?.between_5_30min || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        5-30 min
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
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
                    <CardContent>
                      <div className="space-y-4">
                        {streamAnalytics.platformAnalytics.map(
                          (platform, index) => (
                            <div
                              key={index}
                              className="border-b border-muted pb-4 last:border-0"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="text-xl mr-3">
                                    {getPlatformIcon(platform.platform)}
                                  </span>
                                  <span className="font-medium capitalize">
                                    {platform.platform}
                                  </span>
                                </div>
                                <Badge variant="secondary">
                                  {platform.total_destinations} destinations
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Active:
                                  </span>
                                  <span className="ml-2 font-medium text-green-600">
                                    {platform.active_destinations}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Sources:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {platform.unique_sources}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Users:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {platform.unique_users}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
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

export default AnalyticsPage;
