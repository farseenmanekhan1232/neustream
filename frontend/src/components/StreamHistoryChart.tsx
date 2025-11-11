import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface StreamHistoryData {
  id: string;
  startedAt: string;
  duration: number;
}

interface StreamHistoryChartProps {
  months?: number; // Number of months to display (default: 6)
}

export default function StreamHistoryChart({ months = 6 }: StreamHistoryChartProps) {
  const { user } = useAuth();

  const { data: streamHistory, isLoading, error } = useQuery({
    queryKey: ["stream-history", user?.id, months],
    queryFn: async () => {
      const history = await subscriptionService.getStreamingHistory(100);
      return history as StreamHistoryData[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stream Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading stream history...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !streamHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stream Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          Failed to load stream history
        </CardContent>
      </Card>
    );
  }

  // Helper functions for date manipulation
  const startOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Start from Sunday
    d.setDate(diff);
    return new Date(d);
  };

  const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return new Date(d);
  };

  const subMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return new Date(d);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const format = (date: Date, formatString: string): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    if (formatString === "MMM") return month;
    if (formatString === "MMM d, yyyy") return `${month} ${day}, ${year}`;
    return `${month} ${day}, ${year}`;
  };

  // Generate date range for the chart
  const endDate = new Date();
  const startDate = subMonths(endDate, months);
  const startWeek = startOfWeek(startDate);

  // Create a map of streamed dates with counts
  const streamCounts = new Map<string, number>();
  streamHistory.forEach((stream) => {
    const date = new Date(stream.startedAt);
    const dateKey = date.toDateString();
    streamCounts.set(dateKey, (streamCounts.get(dateKey) || 0) + 1);
  });

  // Generate all weeks and days for the chart
  const weeks: Array<Array<{ date: Date; streamCount: number }>> = [];
  let currentDate = new Date(startWeek);

  while (currentDate <= endDate) {
    const week: Array<{ date: Date; streamCount: number }> = [];

    // Add 7 days for this week
    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(currentDate, i);
      const dateKey = dayDate.toDateString();
      const streamCount = streamCounts.get(dateKey) || 0;

      week.push({
        date: dayDate,
        streamCount,
      });
    }

    weeks.push(week);
    currentDate = addDays(currentDate, 7);
  }

  // Helper function to get intensity level
  const getIntensity = (streamCount: number): number => {
    if (streamCount === 0) return 0;
    if (streamCount === 1) return 1;
    if (streamCount === 2) return 2;
    if (streamCount === 3) return 3;
    return 4;
  };

  // Helper function to get color class based on intensity
  const getColorClass = (intensity: number, isDark: boolean): string => {
    if (isDark) {
      const colors = [
        "bg-gray-800", // 0 - No stream
        "bg-green-900", // 1 - Low
        "bg-green-700", // 2 - Medium
        "bg-green-600", // 3 - High
        "bg-green-500", // 4 - Very High
      ];
      return colors[intensity] || colors[0];
    } else {
      const colors = [
        "bg-gray-100", // 0 - No stream
        "bg-green-200", // 1 - Low
        "bg-green-400", // 2 - Medium
        "bg-green-500", // 3 - High
        "bg-green-600", // 4 - Very High
      ];
      return colors[intensity] || colors[0];
    }
  };

  const isDark = document.documentElement.classList.contains("dark");

  // Find weeks where month changes (for month labels)
  const monthLabels = weeks.map((week, index) => {
    const firstDay = week[0].date;
    const prevWeek = weeks[index - 1];
    const monthChanged = !prevWeek || firstDay.getMonth() !== prevWeek[0].date.getMonth();

    return {
      weekIndex: index,
      month: format(firstDay, "MMM"),
      shouldShow: monthChanged && firstDay.getDate() <= 7,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Stream Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          {months} month{months > 1 ? "s" : ""} of streaming history
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month labels */}
          <div className="flex">
            <div className="w-8"></div> {/* Spacer for day labels */}
            <div className="relative flex-1" style={{ height: "16px" }}>
              {monthLabels.map((label) => (
                <div
                  key={label.weekIndex}
                  className="absolute text-xs text-muted-foreground"
                  style={{
                    left: `${label.weekIndex * 13}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {label.shouldShow ? label.month : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Chart grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="w-8">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
                // Show only Mon, Wed, Fri (like GitHub)
                if (index !== 1 && index !== 3 && index !== 5) return null;

                return (
                  <div
                    key={day}
                    className="text-xs text-muted-foreground h-[13px] flex items-start"
                    style={{ marginBottom: "2px" }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Stream data grid */}
            <div className="overflow-x-auto">
              <div className="flex" style={{ width: `${weeks.length * 13}px` }}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="mr-[1px]">
                    {week.map((day, dayIndex) => {
                      const intensity = getIntensity(day.streamCount);
                      const colorClass = getColorClass(intensity, isDark);
                      const tooltipText = day.streamCount > 0
                        ? `${day.streamCount} stream${day.streamCount > 1 ? "s" : ""} on ${format(day.date, "MMM d, yyyy")}`
                        : `No stream on ${format(day.date, "MMM d, yyyy")}`;

                      return (
                        <div
                          key={dayIndex}
                          className={`
                            w-3 h-3 rounded-sm cursor-pointer transition-opacity hover:opacity-80
                            ${colorClass}
                          `}
                          style={{ marginBottom: "2px" }}
                          title={tooltipText}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Less</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div
                  key={intensity}
                  className={`w-3 h-3 rounded-sm ${getColorClass(intensity, isDark)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
