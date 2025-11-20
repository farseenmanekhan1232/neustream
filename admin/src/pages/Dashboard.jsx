"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Users,
  Activity,
  Wifi,
  Clock,
  TrendingUp,
  DollarSign,
  Crown,
  CreditCard,
  AlertCircle,
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
      const activity = activeStreams.slice(0, 5).map((stream) => ({
        id: stream.id,
        type: "stream_started",
        message: `Stream started by ${stream.email}`,
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

  // eslint-disable-next-line no-unused-vars
  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground mt-2">
              {value}
            </p>
            {change && (
              <p
                className={`text-sm mt-1 ${
                  changeType === "positive"
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {change}
              </p>
            )}
          </div>
          <div
            className={`p-3 rounded-full ${
              title.includes("Active") ? "bg-success/10" : "bg-primary/10"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                title.includes("Active") ? "text-success" : "text-primary"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="text-2xl font-normal text-foreground">Dashboard</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here's what's happening on Neustream today.
        </p>
      </div>

      {/* Error Alert - Show if data failed to load but don't break UI */}
      {stats.totalUsers === 0 && stats.activeStreams === 0 && !loading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                Some data could not be loaded
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Some dashboard stats may be unavailable. Please check the console for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Streams"
          value={stats.activeStreams}
          icon={Activity}
          change="Live now"
          changeType="positive"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          change="+12% from last month"
          changeType="positive"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCard}
          change={`${Math.round(
            (stats.activeSubscriptions / Math.max(stats.totalUsers, 1)) * 100,
          )}% of users`}
          changeType="positive"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          icon={DollarSign}
          change="+8% from last month"
          changeType="positive"
        />
      </div>

      {/* Plan Distribution & System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        {stats.planDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan Distribution</CardTitle>
              <CardDescription>
                Breakdown of users across different subscription tiers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center gap-4">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{plan.name}</span>
                      <span>{plan.user_count || 0} users</span>
                    </div>
                    <Progress
                      value={parseFloat(plan.percentage || "0")}
                      className="mt-1 h-2"
                    />
                  </div>
                  <Badge variant="secondary">
                    {parseFloat(plan.percentage || "0").toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Key metrics for overall system performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-lg font-semibold">{stats.systemUptime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Total Streams</p>
                <p className="text-lg font-semibold">{stats.totalStreams}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-lg font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest streaming activity across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.status === "live" ? "success" : "secondary"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start bg-transparent">
              <Users className="h-4 w-4 mr-2" />
              View All Users
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <Monitor className="h-4 w-4 mr-2" />
              Monitor Streams
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <BarChart className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
