import { StreamPreview } from "@/components/stream-preview"
import { StreamControls } from "@/components/stream-controls"
import { StreamHealth } from "@/components/stream-health"
import { DestinationOverview } from "@/components/destination-overview"
import { StreamPerformance } from "@/components/stream-performance"
import { StreamConnection } from "@/components/stream-connection"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <StreamControls />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StreamPreview />
        </div>
        <div className="space-y-6">
          <StreamHealth />
          <DestinationOverview />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <StreamConnection />
        <StreamPerformance />
      </div>
    </div>
  )
}

