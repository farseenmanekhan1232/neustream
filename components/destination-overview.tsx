"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function DestinationOverview() {
  const destinations = [
    { name: "Twitch", status: "Live" },
    { name: "YouTube", status: "Live" },
    { name: "Facebook", status: "Offline" },
    { name: "TikTok", status: "Live" },
  ]

  const handleToggle = (name: string) => {
    console.log(`Toggled ${name}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Destinations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {destinations.map((dest) => (
            <li key={dest.name} className="flex items-center justify-between">
              <span className="text-sm font-medium">{dest.name}</span>
              <Switch checked={dest.status === "Live"} onCheckedChange={() => handleToggle(dest.name)} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

