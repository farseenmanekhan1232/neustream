"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function StreamStatus() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Twitch</span>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
            >
              Live
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">1080p</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bitrate</span>
            <span>6000 kbps</span>
          </div>
          <Progress value={80} className="h-2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">YouTube</span>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
            >
              Live
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">720p</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bitrate</span>
            <span>4500 kbps</span>
          </div>
          <Progress value={65} className="h-2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Facebook</span>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
            >
              Live
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">720p</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bitrate</span>
            <span>3500 kbps</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>
      </div>
    </div>
  )
}

