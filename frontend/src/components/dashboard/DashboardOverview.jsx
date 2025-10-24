import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardOverviewSkeleton } from "@/components/LoadingSkeletons";
import { useAuth } from "@/contexts/AuthContext";
import { usePostHog } from "@/hooks/usePostHog";
import { apiService } from "@/services/api";
import { subscriptionService } from "@/services/subscription";
import WelcomeSection from "./overview/WelcomeSection";
import SubscriptionStatus from "./overview/SubscriptionStatus";
import QuickActions from "./overview/QuickActions";

function DashboardOverview() {
  const { user } = useAuth();
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [streamDuration, setStreamDuration] = useState(0);
  const { trackUIInteraction } = usePostHog();

  // Fetch all data in parallel using Promise.all for better performance
  const { data: allData, isLoading } = useQuery({
    queryKey: ["dashboard-data", user?.id],
    queryFn: async () => {
      const [streamInfo, destinationsData, sourcesData, subscriptionData] = await Promise.all([
        apiService.get("/streams/info").then(res => res.data).catch(() => null),
        apiService.get("/destinations").then(res => res.data).catch(() => null),
        apiService.get("/sources").then(res => res.data).catch(() => null),
        subscriptionService.getMySubscription().catch(() => null),
      ]);

      return {
        streamInfo,
        destinationsData,
        sourcesData,
        subscriptionData,
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds for live status
    refetchIntervalInBackground: true,
    enabled: !!user,
    staleTime: 5000,
  });

  // Memoize computed values for better performance
  const {
    destinations,
    sources,
    activeSources,
    totalDestinationsAcrossSources,
    streamInfo,
    subscriptionData,
  } = useMemo(() => {
    const data = allData || {};
    const sources = data.sourcesData?.sources || [];
    const destinations = data.destinationsData?.destinations || [];
    const activeSources = sources.filter((source) => source.is_active);

    return {
      destinations,
      sources,
      activeSources,
      totalDestinationsAcrossSources: sources.reduce(
        (sum, source) => sum + parseInt(source.destinations_count || 0, 10),
        0
      ),
      streamInfo: data.streamInfo,
      subscriptionData: data.subscriptionData,
    };
  }, [allData]);

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

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (!user) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection
        user={user}
        sources={sources}
        activeSources={activeSources}
        totalDestinationsAcrossSources={totalDestinationsAcrossSources}
      />

      {/* Subscription Status */}
      <SubscriptionStatus subscriptionData={subscriptionData} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Additional sections can be added here as separate components */}
    </div>
  );
}

export default DashboardOverview;