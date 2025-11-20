import { useMemo } from "react";
import { Clock, Activity, ArrowUpRight, Video } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StreamHistoryChart from "@/components/StreamHistoryChart";
import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription";
import { useAuth } from "@/contexts/AuthContext";

function StatCard({ title, value, change, icon: Icon, description }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change || description) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {change && (
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                {change}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { user } = useAuth();

  // Fetch streaming history
  const { data: streamHistory, isLoading } = useQuery({
    queryKey: ["stream-history", user?.id],
    queryFn: async () => {
      const history = await subscriptionService.getStreamingHistory(1000); // Fetch more items for accurate stats
      return history as any[];
    },
    enabled: !!user,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!streamHistory || streamHistory.length === 0) {
      return {
        totalStreams: 0,
        totalDurationMinutes: 0,
        avgDurationMinutes: 0,
        lastStreamDate: null
      };
    }

    // Filter based on time range if needed (currently fetching all, but could filter)
    // For now, we'll use all fetched history for the "All Time" or "Last 6 Months" view

    const totalStreams = streamHistory.length;
    const totalDurationMinutes = streamHistory.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const avgDurationMinutes = totalStreams > 0 ? totalDurationMinutes / totalStreams : 0;
    
    // Find most recent stream
    const sortedHistory = [...streamHistory].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    const lastStreamDate = sortedHistory.length > 0 ? new Date(sortedHistory[0].startedAt) : null;

    return {
      totalStreams,
      totalDurationMinutes,
      avgDurationMinutes,
      lastStreamDate
    };
  }, [streamHistory]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your stream performance and history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 
            Note: The Select is currently visual-only as the chart handles its own range 
            or we pass it down. For now keeping it simple.
          */}
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Streams"
          value={isLoading ? "..." : stats.totalStreams}
          icon={Video}
          description="In selected period"
        />
        <StatCard
          title="Total Stream Time"
          value={isLoading ? "..." : formatDuration(stats.totalDurationMinutes)}
          icon={Clock}
          description="Total broadcast duration"
        />
        <StatCard
          title="Avg. Session Length"
          value={isLoading ? "..." : formatDuration(stats.avgDurationMinutes)}
          icon={Activity}
          description="Average stream duration"
        />
        {/* 
          Removed "Total Views" and "Avg. Bitrate" as the API does not currently provide this data.
          These can be re-added once the backend supports them.
        */}
      </div>

      {/* Main Chart Section */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Stream History</CardTitle>
          <CardDescription>
            Your streaming activity over the past 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <StreamHistoryChart months={6} />
        </CardContent>
      </Card>

      {/* Recent Streams Table - Removed for now as it duplicates the chart's detail view and we lack rich per-stream metrics */}
    </div>
  );
}
