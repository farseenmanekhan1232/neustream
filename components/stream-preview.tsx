import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StreamPreview() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Live Stream</CardTitle>
        <Badge variant="default" className="bg-red-500 text-white">
          Live
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video bg-muted">
          <video src="/placeholder-video.mp4" className="w-full h-full object-cover" autoPlay muted loop>
            Your browser does not support the video tag.
          </video>
        </div>
      </CardContent>
    </Card>
  )
}

