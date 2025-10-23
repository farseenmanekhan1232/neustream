import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Calendar,
  Download,
  Crown,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SubscriptionAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  // Fetch subscription analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin-subscription-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/subscription-analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { planDistribution, revenueProjection, growthData } = analyticsData || {
    planDistribution: [],
    revenueProjection: [],
    growthData: [],
  };

  // Calculate totals
  const totalActiveUsers = revenueProjection.reduce((sum, plan) => sum + (plan.active_users || 0), 0);
  const totalMonthlyRevenue = revenueProjection.reduce((sum, plan) => sum + (parseFloat(plan.monthly_revenue) || 0), 0);
  const totalAnnualRevenue = totalMonthlyRevenue * 12;

  const getPlanColor = (planName) => {
    switch (planName.toLowerCase()) {
      case "free":
        return "bg-yellow-500";
      case "pro":
        return "bg-blue-500";
      case "business":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "pro":
        return <Zap className="h-4 w-4 text-blue-500" />;
      case "business":
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Crown className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Monitor subscription performance and revenue metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAnnualRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Projected annual revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planDistribution.length}</div>
            <p className="text-xs text-muted-foreground">
              Active subscription plans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>
              Distribution of users across subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPlanIcon(plan.name)}
                    <span className="font-medium">{plan.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPlanColor(plan.name)}`}
                        style={{ width: `${plan.percentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{plan.user_count || 0}</div>
                      <div className="text-xs text-muted-foreground">
                        {plan.percentage ? parseFloat(plan.percentage).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>
              Monthly revenue by subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueProjection.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPlanIcon(plan.name)}
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.active_users || 0} users
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${parseFloat(plan.monthly_revenue || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per month
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Growth</CardTitle>
          <CardDescription>
            New subscriptions and total growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {growthData.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">New Subscriptions</h4>
                  <div className="space-y-2">
                    {growthData.slice(0, 6).map((month) => (
                      <div key={month.month} className="flex justify-between text-sm">
                        <span>
                          {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-medium">{month.new_subscriptions}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Total Subscriptions</h4>
                  <div className="space-y-2">
                    {growthData.slice(0, 6).map((month) => (
                      <div key={month.month} className="flex justify-between text-sm">
                        <span>
                          {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-medium">{month.total_subscriptions}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No growth data available</p>
              <p className="text-sm mt-2">
                Growth data will appear as users subscribe to plans
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Most Popular Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {planDistribution.length > 0 ? (
              <div className="flex items-center space-x-3">
                {getPlanIcon(planDistribution[0].name)}
                <div>
                  <div className="font-medium">{planDistribution[0].name}</div>
                  <div className="text-sm text-muted-foreground">
                    {planDistribution[0].user_count} users
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Highest Revenue Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueProjection.length > 0 ? (
              <div className="flex items-center space-x-3">
                {getPlanIcon(revenueProjection[0].name)}
                <div>
                  <div className="font-medium">{revenueProjection[0].name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${parseFloat(revenueProjection[0].monthly_revenue || 0).toFixed(2)}/month
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {growthData.length > 1 ? (
              <div>
                <div className="font-medium text-green-600">+12%</div>
                <div className="text-sm text-muted-foreground">
                  Last 30 days
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SubscriptionAnalytics;