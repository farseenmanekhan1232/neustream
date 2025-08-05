import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function StreamHealth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Stream Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Bitrate</span>
            <span className="font-semibold">6000 kbps</span>
          </div>
          <Progress value={80} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Frame Rate</span>
            <span className="font-semibold">60 fps</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>CPU Usage</span>
            <span className="font-semibold">45%</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

