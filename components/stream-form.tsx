"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function StreamForm({ streamData }: { streamData?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    // Here you would typically send the form data to your backend
    // For now, we'll just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    router.push("/dashboard/streams")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{streamData ? "Edit Stream" : "Create New Stream"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Stream Title</Label>
            <Input id="title" placeholder="Enter stream title" defaultValue={streamData?.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select defaultValue={streamData?.platform || "twitch"}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitch">Twitch</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Scheduled For</Label>
            <Input id="scheduledFor" type="datetime-local" defaultValue={streamData?.scheduledFor} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter stream description" defaultValue={streamData?.description} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : streamData ? "Update Stream" : "Create Stream"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

