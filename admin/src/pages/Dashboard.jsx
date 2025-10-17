import React, { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Users,
  Activity,
  Wifi,
  WifiOff,
  TrendingUp,
  Clock,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStreams: 0,
    totalStreams: 0,
    systemUptime: "0d 0h 0m",
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

      // Get system statistics
      console.log("📊 Fetching system statistics...");
      const statsResponse = await adminApi.getStats();
      console.log("📊 Stats response:", statsResponse);
      const stats = statsResponse;

      // Get active streams
      console.log("📺 Fetching active streams...");
      const streamsResponse = await adminApi.getActiveStreams();
      console.log("📺 Streams response:", streamsResponse);
      const activeStreams = streamsResponse.activeStreams || [];

      // Update dashboard stats
      setStats({
        totalUsers: stats.users?.total_users || 0,
        activeStreams: activeStreams.length,
        totalStreams: stats.streams?.total_sources || 0,
        systemUptime: calculateUptime(),
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p
              className={`text-sm ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${
            title.includes("Active") ? "bg-green-100" : "bg-blue-100"
          }`}
        >
          <Icon
            className={`h-6 w-6 ${
              title.includes("Active") ? "text-green-600" : "text-blue-600"
            }`}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening on Neustream today.
        </p>
      </div>

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
          title="System Status"
          value="Online"
          icon={Wifi}
          change="All systems operational"
          changeType="positive"
        />
        <StatCard
          title="Uptime"
          value={stats.systemUptime}
          icon={Clock}
          change="Last 30 days"
          changeType="positive"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No recent activity
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Activity will appear here as users start streaming.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Users className="h-4 w-4 mr-2" />
              View All Users
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Activity className="h-4 w-4 mr-2" />
              Monitor Streams
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
