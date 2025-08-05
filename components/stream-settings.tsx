"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function StreamSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings updated",
        description: "Your streaming settings have been updated successfully.",
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streaming Settings</CardTitle>
        <CardDescription>Configure your default streaming preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="default-quality">Default Quality</Label>
              <Select defaultValue="1080p">
                <SelectTrigger id="default-quality">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="360p">360p</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="default-bitrate">Default Bitrate (kbps)</Label>
              <Input id="default-bitrate" type="number" defaultValue="4500" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="default-fps">Default FPS</Label>
              <Select defaultValue="60">
                <SelectTrigger id="default-fps">
                  <SelectValue placeholder="Select FPS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="24">24 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="auto-start" defaultChecked />
              <Label htmlFor="auto-start">Automatically start streaming when source is detected</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="low-latency" defaultChecked />
              <Label htmlFor="low-latency">Enable low latency mode</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="backup-recording" />
              <Label htmlFor="backup-recording">Save backup recording of streams</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

