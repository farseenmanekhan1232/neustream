import { useState, useEffect } from "react";
import {
  Plus,
  Settings,
  Copy,
  Check,
  X,
  Radio,
  Youtube,
  Twitch,
  Facebook,
  ExternalLink,
  Play,
  Square,
  MessageSquare,
  Users,
  Eye,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StreamingDemo = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState("demo-key-abc123");
  const [rtmpUrl, setRtmpUrl] = useState("rtmp://demo.neustream.app/live");
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [streamStats, setStreamStats] = useState({
    viewers: 0,
    duration: "00:00:00",
    bitrate: "0 kbps",
    fps: 0,
  });

  const platforms = [
    {
      id: "youtube",
      name: "YouTube",
      icon: <Youtube className="h-5 w-5 text-red-500" />,
      color: "bg-red-50 border-red-200",
      connected: false,
    },
    {
      id: "twitch",
      name: "Twitch",
      icon: <Twitch className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-50 border-purple-200",
      connected: false,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
      connected: false,
    },
    {
      id: "custom",
      name: "Custom RTMP",
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      color: "bg-gray-50 border-gray-200",
      connected: false,
    },
  ];

  useEffect(() => {
    let interval;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamStats((prev) => ({
          viewers: prev.viewers + Math.floor(Math.random() * 5),
          duration: incrementTime(prev.duration),
          bitrate: `${2500 + Math.floor(Math.random() * 500)} kbps`,
          fps: 30,
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const incrementTime = (time) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
    const newHours = Math.floor(totalSeconds / 3600);
    const newMinutes = Math.floor((totalSeconds % 3600) / 60);
    const newSeconds = totalSeconds % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;
  };

  const handleCopy = async (text) => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddDestination = () => {
    const platform = platforms.find((p) => p.id === selectedPlatform);
    if (platform && !destinations.find((d) => d.id === selectedPlatform)) {
      setDestinations([...destinations, { ...platform, connected: true }]);
      setSelectedPlatform("");
      setShowAddDialog(false);
    }
  };

  const handleRemoveDestination = (id) => {
    setDestinations(destinations.filter((d) => d.id !== id));
  };

  const handleStreamToggle = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      setStreamStats({
        viewers: 0,
        duration: "00:00:00",
        bitrate: "0 kbps",
        fps: 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Interactive Streaming Demo
          </CardTitle>
          <CardDescription>
            Try out the neustream interface without going live. This is a fully
            functional demo that simulates the real streaming experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stream-config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stream-config">Stream Config</TabsTrigger>
              <TabsTrigger value="destinations">Destinations</TabsTrigger>
              <TabsTrigger value="chat">Chat Connectors</TabsTrigger>
            </TabsList>

            <TabsContent value="stream-config" className="space-y-6">
              {/* Stream Configuration */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Stream Information
                    </CardTitle>
                    <CardDescription>
                      Use these details in your broadcasting software (OBS,
                      Streamlabs, etc.)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="rtmp-url">RTMP URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="rtmp-url"
                          value={rtmpUrl}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(rtmpUrl)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="stream-key">Stream Key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="stream-key"
                          value={streamKey}
                          readOnly
                          className="font-mono text-sm"
                          type="password"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(streamKey)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        className={`w-full ${isStreaming ? "bg-red-600 hover:bg-red-700" : ""}`}
                        onClick={handleStreamToggle}
                      >
                        {isStreaming ? (
                          <>
                            <Square className="h-4 w-4 mr-2" />
                            End Stream
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Streaming
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stream Status</CardTitle>
                    <CardDescription>
                      {isStreaming
                        ? "Your stream is live!"
                        : "Start streaming to see real-time stats"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {streamStats.viewers}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total Viewers
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {streamStats.bitrate}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Bitrate</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <span className="text-2xl font-bold">
                          {streamStats.fps}
                        </span>
                        <p className="text-xs text-muted-foreground">FPS</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <span className="text-lg font-bold">
                          {streamStats.duration}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                      </div>
                    </div>
                    {isStreaming && (
                      <div className="flex items-center justify-center gap-2 p-2 bg-green-50 text-green-700 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">LIVE</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Instructions */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h4 className="font-medium text-blue-900 mb-2">
                    How to use this demo:
                  </h4>
                  <ol className="space-y-1 text-sm text-blue-800">
                    <li>
                      1. Add streaming destinations in the "Destinations" tab
                    </li>
                    <li>
                      2. Click "Start Streaming" to simulate a live stream
                    </li>
                    <li>3. Watch the stats update in real-time</li>
                    <li>4. Try adding/removing destinations while streaming</li>
                    <li>
                      5. Explore the chat connectors tab for integration options
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="destinations" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Streaming Destinations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add platforms where you want to stream simultaneously
                  </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Destination
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Streaming Destination</DialogTitle>
                      <DialogDescription>
                        Choose a platform to add to your streaming destinations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform">Platform</Label>
                        <Select
                          value={selectedPlatform}
                          onValueChange={setSelectedPlatform}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {platforms.map((platform) => (
                              <SelectItem key={platform.id} value={platform.id}>
                                <div className="flex items-center gap-2">
                                  {platform.icon}
                                  {platform.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAddDestination}
                        disabled={!selectedPlatform}
                        className="w-full"
                      >
                        Add Platform
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {destinations.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Radio className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h4 className="text-lg font-medium">
                          No destinations yet
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Add your first streaming destination to start
                          multi-platform broadcasting
                        </p>
                      </div>
                      <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Platform
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {destinations.map((destination) => (
                    <Card key={destination.id} className={destination.color}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {destination.icon}
                            <CardTitle className="text-lg">
                              {destination.name}
                            </CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveDestination(destination.id)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isStreaming ? "default" : "secondary"}
                            >
                              {isStreaming ? "Connected" : "Ready"}
                            </Badge>
                            {isStreaming && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-muted-foreground">
                                  Live
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {Math.floor(Math.random() * 100)} viewers
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open {destination.name}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Chat Connectors</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Connect your chat from different platforms to interact with
                  your audience
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {destinations.map((destination) => (
                    <Card key={destination.id} className="border-dashed">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          {destination.name} Chat
                        </CardTitle>
                        <CardDescription>
                          Connect to {destination.name} live chat
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Connect {destination.name} Chat
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  {destinations.length === 0 && (
                    <Card className="border-dashed md:col-span-2">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <h4 className="text-lg font-medium">
                              No platforms connected
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Add streaming destinations first to connect their
                              chats
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamingDemo;
