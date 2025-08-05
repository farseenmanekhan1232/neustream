import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit2, Trash2 } from "lucide-react"
import Link from "next/link"

const streams = [
  {
    id: "1",
    title: "Weekly Gaming Stream",
    platform: "Twitch",
    scheduledFor: "2023-06-15T20:00:00Z",
    isLive: true,
  },
  {
    id: "2",
    title: "Q&A Session",
    platform: "YouTube",
    scheduledFor: "2023-06-18T18:30:00Z",
    isLive: false,
  },
  {
    id: "3",
    title: "Cooking Stream",
    platform: "Facebook",
    scheduledFor: "2023-06-20T19:00:00Z",
    isLive: false,
  },
]

export function StreamsList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {streams.map((stream) => (
        <Card key={stream.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stream.title}</CardTitle>
            <Badge variant={stream.isLive ? "default" : "secondary"}>{stream.isLive ? "Live" : "Scheduled"}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">{new Date(stream.scheduledFor).toLocaleString()}</div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex-1">{stream.platform}</div>
              <Switch checked={stream.isLive} />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Link href={`/dashboard/streams/edit/${stream.id}`}>
                <Button variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

