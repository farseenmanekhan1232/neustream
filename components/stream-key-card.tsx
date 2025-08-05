"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Copy, RefreshCw } from "lucide-react"

export function StreamKeyCard() {
  const { toast } = useToast()
  const [showKey, setShowKey] = useState(false)

  const streamUrl = "rtmp://stream.neustream.com/live"
  const streamKey = "abcd-efgh-ijkl-mnop-qrst-uvwx-yz12"

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${type} copied`,
      description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
    })
  }

  const regenerateKey = () => {
    toast({
      title: "Stream key regenerated",
      description: "Your new stream key has been generated. Update your broadcasting software.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Unified Stream Key</CardTitle>
        <CardDescription>Use this information in your broadcasting software like OBS Studio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="stream-url">Stream URL</Label>
          <div className="flex">
            <Input id="stream-url" value={streamUrl} readOnly className="font-mono" />
            <Button
              variant="outline"
              size="icon"
              className="ml-2"
              onClick={() => copyToClipboard(streamUrl, "Stream URL")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stream-key">Stream Key</Label>
          <div className="flex">
            <Input
              id="stream-key"
              type={showKey ? "text" : "password"}
              value={showKey ? streamKey : "••••••••••••••••••••••••••••••"}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              className="ml-2"
              onClick={() => copyToClipboard(streamKey, "Stream Key")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="link" className="h-auto p-0 text-sm" onClick={() => setShowKey(!showKey)}>
            {showKey ? "Hide" : "Show"} stream key
          </Button>
        </div>

        <div className="rounded-md bg-muted p-4">
          <h4 className="mb-2 text-sm font-medium">How to use in OBS Studio</h4>
          <ol className="ml-4 list-decimal text-sm text-muted-foreground">
            <li className="mb-1">Open OBS Studio and go to Settings</li>
            <li className="mb-1">Select the "Stream" tab</li>
            <li className="mb-1">For "Service" select "Custom..."</li>
            <li className="mb-1">Enter the Stream URL and Stream Key from above</li>
            <li>Click "OK" and then "Start Streaming" when ready</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={regenerateKey}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate Stream Key
        </Button>
      </CardFooter>
    </Card>
  )
}

