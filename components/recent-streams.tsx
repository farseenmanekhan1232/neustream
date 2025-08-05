"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentStreams() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>YT</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">YouTube Gaming Stream</p>
          <p className="text-sm text-muted-foreground">Today at 3:45 PM • 2h 30m</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-2">
            720p
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
          >
            Completed
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>TW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Twitch Weekly Show</p>
          <p className="text-sm text-muted-foreground">Yesterday at 8:00 PM • 3h 15m</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-2">
            1080p
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
          >
            Completed
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Facebook Live Q&A</p>
          <p className="text-sm text-muted-foreground">2 days ago at 6:30 PM • 1h 45m</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-2">
            720p
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
          >
            Completed
          </Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>IG</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Instagram Live Event</p>
          <p className="text-sm text-muted-foreground">3 days ago at 5:00 PM • 1h 00m</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="ml-2">
            720p
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/10 hover:text-green-500"
          >
            Completed
          </Badge>
        </div>
      </div>
    </div>
  )
}

