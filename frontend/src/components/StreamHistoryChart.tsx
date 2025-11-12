import React from "react";
import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, Calendar } from "lucide-react";
import { useState } from "react";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: streamHistory, isLoading, error } = useQuery({
    queryKey: ["stream-history", user?.id, months],
    queryFn: async () => {
      const history = await subscriptionService.getStreamingHistory(100);
      return history as StreamHistoryData[];
    },
    enabled: !!user,
  });

  // Auto-select the most recent streaming date when data loads
  React.useEffect(() => {
    if (streamHistory && streamHistory.length > 0) {
      // Find the most recent stream
      const mostRecentStream = streamHistory.reduce((prev, current) => {
        const prevDate = new Date(prev.startedAt);
        const currentDate = new Date(current.startedAt);
        return currentDate > prevDate ? current : prev;
      });

      // Set the date of the most recent stream
      const mostRecentDate = new Date(mostRecentStream.startedAt);
      setSelectedDate(mostRecentDate);
    }
  }, [streamHistory]);

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

  // Helper function to format duration in minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim();
  };

  // Helper function to get streams for a specific date
  const getStreamsForDate = (date: Date): StreamHistoryData[] => {
    if (!streamHistory) return [];
    return streamHistory.filter((stream) => {
      const streamDate = new Date(stream.startedAt);
      return (
        streamDate.getFullYear() === date.getFullYear() &&
        streamDate.getMonth() === date.getMonth() &&
        streamDate.getDate() === date.getDate()
      );
    });
  };

  // Helper function to format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    if (streamCount <= 2) return 1; // 1-2 streams = low
    if (streamCount <= 4) return 2; // 3-4 streams = medium-low
    if (streamCount <= 6) return 3; // 5-6 streams = medium
    return 4; // 7+ streams = high
  };

  // Helper function to get color class based on intensity
  const getColorClass = (intensity: number, isDark: boolean): string => {
    if (isDark) {
      // Dark mode colors
      const colors = [
        "bg-muted/20", // 0 - Very light gray for empty days
        "bg-emerald-900", // 1 - Very dark green
        "bg-emerald-800", // 2 - Dark green
        "bg-emerald-600", // 3 - Medium green
        "bg-emerald-500", // 4 - Bright green
      ];
      return colors[intensity] || colors[0];
    } else {
      // Light mode colors
      const colors = [
        "bg-muted/30", // 0 - Light gray for empty days
        "bg-emerald-200", // 1 - Very light green
        "bg-emerald-400", // 2 - Light green
        "bg-emerald-500", // 3 - Medium green
        "bg-emerald-600", // 4 - Dark green
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
      width: index < weeks.length - 1 ? 12 : 12, // Each week column is 12px
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
        <div className="space-y-3">
          {/* Month labels */}
          <div className="flex items-center">
            <div className="w-12"></div> {/* Spacer for day labels */}
            <div className="flex-1">
              <div className="relative" style={{ height: "20px" }}>
                {monthLabels.map((label, index) => {
                  if (!label.shouldShow) return null;

                  // Calculate position: find how many weeks until next month
                  let width = 14; // default width
                  for (let i = label.weekIndex + 1; i < weeks.length; i++) {
                    if (monthLabels[i].shouldShow) {
                      width = (i - label.weekIndex) * 14;
                      break;
                    }
                    if (i === weeks.length - 1) {
                      width = (weeks.length - label.weekIndex) * 14;
                    }
                  }

                  return (
                    <div
                      key={`month-${label.weekIndex}`}
                      className="absolute text-xs text-muted-foreground top-0"
                      style={{
                        left: `${label.weekIndex * 14}px`,
                        width: `${width}px`,
                      }}
                    >
                      {label.month}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart grid */}
          <div className="flex">
            {/* Day labels - GitHub style (Mon, Wed, Fri) */}
            <div className="w-12 pr-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
                // Show only Mon, Wed, Fri with proper spacing
                const displayDays = [1, 3, 5]; // Mon, Wed, Fri
                if (!displayDays.includes(index)) {
                  return <div key={day} className="h-4"></div>; // Empty spacer for non-displayed days
                }

                return (
                  <div
                    key={day}
                    className="text-xs text-muted-foreground h-4 flex items-start"
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Stream data grid */}
            <div>
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
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
                            w-3.5 h-3.5 rounded-sm cursor-pointer transition-all duration-200
                            ${day.streamCount > 0
                              ? 'hover:scale-110 hover:z-10 hover:-translate-y-0.5'
                              : 'hover:bg-muted/50 cursor-default'}
                            ${colorClass}
                            ${selectedDate && isSameDay(day.date, selectedDate) ? 'ring-2 ring-primary' : ''}
                          `}
                          title={tooltipText}
                          onClick={() => {
                            if (day.streamCount > 0) {
                              setSelectedDate(day.date);
                            }
                          }}
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
                  key={`legend-${intensity}`}
                  className={`
                    w-3.5 h-3.5 rounded-sm
                    ${getColorClass(intensity, isDark)}
                  `}
                />
              ))}
            </div>
            <span>More</span>
          </div>

          {/* Contribution summary */}
          <div className="pt-3 text-sm text-muted-foreground border-t">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{streamHistory.length}</span> stream{streamHistory.length !== 1 ? "s" : ""} in the last {months} month{months > 1 ? "s" : ""}
              </div>
              {(() => {
                const totalMinutes = streamHistory.reduce((sum, stream) => sum + stream.duration, 0);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return (
                  <div>
                    <span className="font-medium">{hours}h {minutes}m</span> total
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(selectedDate, "MMM d, yyyy")}
                </h3>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {(() => {
                const dayStreams = getStreamsForDate(selectedDate);
                const totalMinutes = dayStreams.reduce((sum, stream) => sum + stream.duration, 0);

                return (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-primary"></div>
                        <span>{dayStreams.length} stream{dayStreams.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Total: {formatDuration(totalMinutes)}</span>
                      </div>
                    </div>

                    {/* Stream List */}
                    {dayStreams.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Stream Sessions:
                        </div>
                        <div className="space-y-2">
                          {dayStreams.map((stream, index) => (
                            <div
                              key={stream.id || index}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {formatTime(stream.startedAt)}
                                  </div>
                                  {stream.sourceName && (
                                    <div className="text-xs text-muted-foreground">
                                      {stream.sourceName}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm font-medium">
                                {formatDuration(stream.duration)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
