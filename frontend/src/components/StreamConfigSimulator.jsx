import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Play,
  Square,
  Monitor,
  Gamepad2,
  Camera,
  Mic,
  Copy,
  ExternalLink,
  RefreshCw,
  MessageCircle,
  ChefHat,
  Music,
  Facebook,
  Twitch,
  Youtube,
} from "lucide-react";

const SOURCES = {
  gaming: {
    name: "PUBG Ranked Grind to Diamond",
    icon: Gamepad2,
    color: "bg-purple-500",
    destinations: ["youtube", "facebook"],
  },
  justchatting: {
    name: "Late Night Vibes & Chat",
    icon: MessageCircle,
    color: "bg-blue-500",
    destinations: ["youtube", "tiktok"],
  },
};

const DESTINATIONS = {
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-500",
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    status: "connected",
  },
  twitch: {
    name: "Twitch",
    icon: Twitch,
    color: "bg-purple-500",
    rtmpUrl: "rtmp://live.twitch.tv/live",
    status: "connected",
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-500",
    rtmpUrl: "rtmp://live-api-s.facebook.com:80/rtmp/",
    status: "connected",
  },
  tiktok: {
    name: "TikTok",
    icon: Music, // Using Music icon for TikTok since it's short-form video content
    color: "bg-black",
    rtmpUrl: "rtmp://push.tiktok.com/live/",
    status: "disconnected",
  },
};

function StreamConfigSimulator() {
  const [activeSource, setActiveSource] = useState("gaming");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamMetrics, setStreamMetrics] = useState({
    duration: 0,
    bitrate: 0,
    fps: 0,
  });
  const [copiedField, setCopiedField] = useState(null);
  const scrollContainerRef = useRef(null);

  const currentSource = SOURCES[activeSource];
  const activeDestinations = currentSource.destinations;

  const handleSourceChange = (sourceId) => {
    setActiveSource(sourceId);
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate streaming metrics
  useEffect(() => {
    let interval;

    if (isStreaming) {
      interval = setInterval(() => {
        setStreamMetrics((prev) => ({
          duration: prev.duration + 1,
          bitrate: 4500 + Math.floor((Math.random() - 0.5) * 1000),
          fps: 60 + Math.floor((Math.random() - 0.5) * 4),
        }));
      }, 1000);
    } else {
      setStreamMetrics({ duration: 0, bitrate: 0, fps: 0 });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="bg-white text-black flex flex-col border-0  rounded-lg shadow-sm">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Monitor className="h-5 w-5 mr-2 " />
            Stream Configuration
          </span>
          <Button
            size="sm"
            variant={isStreaming ? "destructive" : "default"}
            onClick={toggleStreaming}
            className="h-8 px-3"
          >
            {isStreaming ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          Manage streaming sources and destinations
        </CardDescription>
      </CardHeader>

      <CardContent
        className="flex-1 space-y-6 p-4 overflow-y-auto"
        ref={scrollContainerRef}
      >
        {/* Source Selection */}
        <div className="space-y-3">
          <div className="text-sm font-medium ">Active Stream</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SOURCES).map(([key, source]) => {
              const Icon = source.icon;
              const isActive = activeSource === key;

              return (
                <button
                  key={key}
                  onClick={() => handleSourceChange(key)}
                  className={`p-3 rounded-lg transition-all ${
                    isActive
                      ? "border-gray-700 bg-primary/40"
                      : "border-gray-600 bg-primary/10"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs font-medium">{source.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Destinations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium ">Destinations</div>
            <Badge variant="outline" className="text-xs text-black">
              {activeDestinations.length} platforms
            </Badge>
          </div>

          <div className="space-y-2">
            {activeDestinations.map((destId) => {
              const dest = DESTINATIONS[destId];
              const isConnected = dest.status === "connected";

              return (
                <div key={destId} className="p-3 rounded-lg bg-black/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${dest.color} text-white`}>
                        <dest.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{dest.name}</span>
                      <Badge
                        variant={isConnected ? "default" : "secondary"}
                        className={`text-xs ${isConnected ? "bg-green-500" : ""}`}
                      >
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 bg-black/10"
                      onClick={() =>
                        copyToClipboard(dest.rtmpUrl, `${destId}-rtmp`)
                      }
                    >
                      {copiedField === `${destId}-rtmp` ? (
                        <span className="text-xs">Copied!</span>
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <div className="text-xs font-mono p-2 rounded text-black/50">
                    {dest.rtmpUrl}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StreamConfigSimulator;
