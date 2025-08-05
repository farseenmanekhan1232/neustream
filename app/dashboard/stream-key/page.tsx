import { StreamKeyCard } from "@/components/stream-key-card"

export default function StreamKeyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Stream Key</h1>
        <p className="text-muted-foreground">
          Use this unified RTMP URL and stream key to stream from your broadcasting software
        </p>
      </div>
      <StreamKeyCard />
    </div>
  )
}

