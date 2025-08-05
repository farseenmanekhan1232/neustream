"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Copy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function StreamConnection() {
  const [streamKey, setStreamKey] = useState("xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx")
  const [showStreamKey, setShowStreamKey] = useState(false)

  const handleCopyStreamKey = () => {
    navigator.clipboard.writeText(streamKey)
    // You might want to add a toast notification here
  }

  const handleRegenerateStreamKey = () => {
    // This should call an API to regenerate the stream key
    setStreamKey("new-stream-key-here")
    // You might want to add a toast notification here
  }

  const toggleShowStreamKey = () => {
    setShowStreamKey(!showStreamKey)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Stream Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="rtmp-url" className="text-sm font-medium">
            RTMP URL
          </label>
          <Input id="rtmp-url" value="rtmp://stream.neustream.com/live" readOnly />
        </div>
        <div>
          <label htmlFor="stream-key" className="text-sm font-medium">
            Stream Key
          </label>
          <div className="flex space-x-2">
            <Input id="stream-key" type={showStreamKey ? "text" : "password"} value={streamKey} readOnly />
            <Button variant="outline" size="icon" onClick={handleCopyStreamKey}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="link" className="px-0 text-xs" onClick={toggleShowStreamKey}>
            {showStreamKey ? "Hide" : "Show"} Stream Key
          </Button>
        </div>
        <Button onClick={handleRegenerateStreamKey}>Regenerate Stream Key</Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Keep your stream key secret. If you believe it has been compromised, regenerate it immediately.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

