import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RefreshCw, Settings, Share2 } from "lucide-react"

export function StreamActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stream Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button className="flex-1">
          <Play className="mr-2 h-4 w-4" /> Start Stream
        </Button>
        <Button className="flex-1" variant="secondary">
          <Pause className="mr-2 h-4 w-4" /> Pause
        </Button>
        <Button className="flex-1" variant="secondary">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
        <Button className="flex-1" variant="outline">
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
        <Button className="flex-1" variant="outline">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </CardContent>
    </Card>
  )
}

