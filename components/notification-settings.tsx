"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function NotificationSettings() {
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
        description: "Your notification settings have been updated successfully.",
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email Notifications</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-stream-start" className="flex-1">
                Stream start notifications
              </Label>
              <Switch id="email-stream-start" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-stream-issues" className="flex-1">
                Stream health issues
              </Label>
              <Switch id="email-stream-issues" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-billing" className="flex-1">
                Billing and subscription updates
              </Label>
              <Switch id="email-billing" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-newsletter" className="flex-1">
                Newsletter and product updates
              </Label>
              <Switch id="email-newsletter" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Push Notifications</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="push-stream-start" className="flex-1">
                Stream start notifications
              </Label>
              <Switch id="push-stream-start" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="push-stream-issues" className="flex-1">
                Stream health issues
              </Label>
              <Switch id="push-stream-issues" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="push-viewer-milestones" className="flex-1">
                Viewer milestone achievements
              </Label>
              <Switch id="push-viewer-milestones" defaultChecked />
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

