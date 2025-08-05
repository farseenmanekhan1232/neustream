"use client"

import { Progress } from "@/components/ui/progress"

export function StreamQualityMetrics() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Average Bitrate</span>
          <span className="text-sm font-medium">4.8 Mbps</span>
        </div>
        <Progress value={80} className="h-2" />
        <p className="text-xs text-muted-foreground">Good - Your average bitrate is stable</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Frame Rate</span>
          <span className="text-sm font-medium">58 fps</span>
        </div>
        <Progress value={96} className="h-2" />
        <p className="text-xs text-muted-foreground">Excellent - Your frame rate is consistent</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Dropped Frames</span>
          <span className="text-sm font-medium">1.2%</span>
        </div>
        <Progress value={98} className="h-2" />
        <p className="text-xs text-muted-foreground">Excellent - Minimal dropped frames</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Stream Stability</span>
          <span className="text-sm font-medium">97%</span>
        </div>
        <Progress value={97} className="h-2" />
        <p className="text-xs text-muted-foreground">Excellent - Your stream is very stable</p>
      </div>
    </div>
  )
}

