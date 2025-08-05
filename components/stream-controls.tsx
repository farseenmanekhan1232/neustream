"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw } from "lucide-react"

export function StreamControls() {
  const handleGoLive = () => {
    console.log("Go Live clicked")
  }

  const handlePause = () => {
    console.log("Pause clicked")
  }

  const handleRefresh = () => {
    console.log("Refresh clicked")
  }

  return (
    <div className="flex items-center space-x-2">
      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleGoLive}>
        <Play className="mr-2 h-4 w-4" /> Go Live
      </Button>
      <Button size="sm" variant="outline" onClick={handlePause}>
        <Pause className="mr-2 h-4 w-4" /> Pause
      </Button>
      <Button size="sm" variant="outline" onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  )
}

