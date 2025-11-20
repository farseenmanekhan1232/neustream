"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Users,
  Activity,
  DollarSign,
  CreditCard,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MinimalStatCard } from "../components/common/MinimalStatCard";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStreams: 0,
    totalStreams: 0,
    systemUptime: "0d 0h 0m",
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    planDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log("🔄 Loading dashboard data...");

      let stats = { users: {}, streams: {} };
      let activeStreams = [];
      let subscriptionData = {
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        planDistribution: [],
      };

      // Get system statistics with error handling
      try {
        console.log("📊 Fetching system statistics...");
        const statsResponse = await adminApi.getStats();
        console.log("📊 Stats response:", statsResponse);
        stats = statsResponse?.data || stats;
      } catch (statsError) {
        console.warn("⚠️ Could not load stats:", statsError);
      }

      // Get active streams with error handling
      try {
        console.log("📺 Fetching active streams...");
        const streamsResponse = await adminApi.getActiveStreams();
        console.log("📺 Streams response:", streamsResponse);
        activeStreams = streamsResponse?.data?.streams || [];
      } catch (streamsError) {
        console.warn("⚠️ Could not load active streams:", streamsError);
      }

      // Get subscription analytics with error handling
      try {
        console.log("💰 Fetching subscription analytics...");
        const subscriptionResponse = await adminApi.getSubscriptionAnalytics();
        console.log("💰 Subscription response:", subscriptionResponse);

        // Calculate subscription metrics
        const data = subscriptionResponse?.data || {};
        const revenueProjection = data.revenueProjection || [];
        const planDistribution = data.planDistribution || [];

        const totalActiveUsers = revenueProjection.reduce(
          (sum, plan) => sum + (plan.active_users || 0),
          0,
        );
        const totalMonthlyRevenue = revenueProjection.reduce(
          (sum, plan) => sum + (parseFloat(plan.monthly_revenue) || 0),
          0,
        );

        subscriptionData = {
          activeSubscriptions: totalActiveUsers,
          monthlyRevenue: totalMonthlyRevenue,
          planDistribution: planDistribution,
        };
      } catch (subscriptionError) {
        console.warn(
          "⚠️ Could not load subscription analytics:",
          subscriptionError,
        );
      }

      // Update dashboard stats
      setStats({
        totalUsers: stats.users?.total_users || 0,
        activeStreams: activeStreams.length,
        totalStreams: stats.streams?.total_sources || 0,
        systemUptime: calculateUptime(),
        activeSubscriptions: subscriptionData.activeSubscriptions,
        monthlyRevenue: subscriptionData.monthlyRevenue,
        planDistribution: subscriptionData.planDistribution,
      });

      // Process recent activity from streams
      const activity = activeStreams.slice(0, 10).map((stream) => ({
        id: stream.id,
        type: "stream_started",
        user: stream.email,
        message: `Started streaming`,
        timestamp: stream.started_at,
        icon: Activity,
      }));

      setRecentActivity(activity);
      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load dashboard data:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateUptime = () => {
    // This would come from a system endpoint
    const uptime = "99.9%";
    return uptime;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now - then) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-minimal">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const displayedActivity = showAllActivity
    ? recentActivity
    : recentActivity.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's what's happening on Neustream today.
        </p>
      </div>

      {/* Error Alert - Show if data failed to load but don't break UI */}
      {stats.totalUsers === 0 && stats.activeStreams === 0 && !loading && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">
                  Some data could not be loaded
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Some dashboard stats may be unavailable. Please check the
                  console for details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MinimalStatCard
          title="Active Streams"
          value={stats.activeStreams}
          icon={Activity}
          trend="Live now"
          trendType="positive"
        />
        <MinimalStatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="+12% from last month"
          trendType="positive"
        />
        <MinimalStatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend="+8% from last month"
          trendType="positive"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plans Distribution */}
        {stats.planDistribution.length > 0 && (
          <Card className="card-minimal hover-lift">
            <CardHeader>
              <CardTitle className="text-lg">Subscription Plans</CardTitle>
              <CardDescription>
                User distribution across subscription tiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.planDistribution.map((plan) => (
                <div key={plan.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          plan.name === "Free"
                            ? "bg-muted-foreground"
                            : plan.name === "Pro"
                            ? "bg-primary"
                            : "bg-success"
                        }`}
                      />
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {plan.user_count || 0} users ({parseFloat(plan.percentage || "0").toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={parseFloat(plan.percentage || "0")}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* System Health */}
        <Card className="card-minimal hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>
              Key metrics for platform performance
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-semibold">{stats.systemUptime}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Streams</p>
              <p className="text-2xl font-semibold">{stats.totalStreams}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Subscriptions</p>
              <p className="text-2xl font-semibold">
                {stats.activeSubscriptions}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-success/10 text-success border-success/20">
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="card-minimal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>
                Latest streaming activity across the platform
              </CardDescription>
            </div>
            {recentActivity.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActivity(!showAllActivity)}
              >
                {showAllActivity ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {displayedActivity.length > 0 ? (
            <div className="space-y-4">
              {displayedActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 py-3 ${
                    index !== displayedActivity.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }`}
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-medium text-foreground">
                No recent activity
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Activity will appear here as users start streaming.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-minimal">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/users">
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-3 py-6 hover-lift"
              >
                <Users className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Manage Users</span>
              </Button>
            </Link>
            <Link to="/streams">
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-3 py-6 hover-lift"
              >
                <Activity className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Monitor Streams</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-3 py-6 hover-lift"
              >
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">View Analytics</span>
              </Button>
            </Link>
            <Link to="/user-subscriptions">
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-3 py-6 hover-lift"
              >
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Subscriptions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
