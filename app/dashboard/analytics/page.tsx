import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViewerOverview } from "@/components/analytics/viewer-overview"
import { StreamPerformance } from "@/components/analytics/stream-performance"
import { TopStreams } from "@/components/analytics/top-streams"
import { EngagementMetrics } from "@/components/analytics/engagement-metrics"
import { RevenueOverview } from "@/components/analytics/revenue-overview"
import { PlatformBreakdown } from "@/components/analytics/platform-breakdown"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ViewerOverview />
            <PlatformBreakdown />
          </div>
          <StreamPerformance />
        </TabsContent>

        <TabsContent value="streams" className="space-y-4">
          <TopStreams />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <EngagementMetrics />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}

