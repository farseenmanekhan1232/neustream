import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  const activities = [
    { message: "Stream started on Twitch", time: "2m ago" },
    { message: "New follower on YouTube", time: "5m ago" },
    { message: "1000 viewers on Facebook", time: "10m ago" },
    { message: "Stream ended on TikTok", time: "1h ago" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {activities.map((activity, index) => (
            <li key={index} className="flex justify-between items-start text-sm">
              <span className="text-muted-foreground">{activity.message}</span>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

