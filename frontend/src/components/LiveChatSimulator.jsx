import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  MessageCircle,
  Users,
  Play,
  Square,
  Youtube,
  Twitch,
  Facebook,
  Music,
} from "lucide-react";
import { Button } from "./ui/button";

const PLATFORMS = {
  youtube: {
    name: "YouTube",
    color: "bg-red-500 text-white border-red-200",
    icon: Youtube,
  },
  twitch: {
    name: "Twitch",
    color: "bg-purple-500 text-white border-purple-200",
    icon: Twitch,
  },
  facebook: {
    name: "Facebook",
    color: "bg-blue-500 text-white border-blue-200",
    icon: Facebook,
  },
  tiktok: {
    name: "TikTok",
    color: "bg-black text-white border-gray-300",
    icon: Music,
  },
};

const MOCK_USERS = [
  "GamerPro123",
  "StreamFan99",
  "ContentCreator",
  "Viewer2024",
  "ChatMaster",
  "TechEnthusiast",
  "CreativeGamer",
  "LiveStreamLover",
  "DigitalCreator",
  "StreamSupporter",
];

const MOCK_MESSAGES = [
  "Great stream!",
  "Love the content!",
  "Amazing quality!",
  "Keep it up!",
  "Best streamer ever!",
  "This is awesome!",
  "Nice gameplay!",
  "Great commentary!",
  "Love this!",
  "So entertaining!",
  "Quality content!",
  "Well done!",
  "Incredible skills!",
  "Fantastic stream!",
  "Really enjoying this!",
];

function LiveChatSimulator() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      authorName: "GamerPro123",
      messageText: "Great stream!",
      platform: "youtube",
      messageType: "text",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      authorName: "StreamFan99",
      messageText: "Love the content!",
      platform: "twitch",
      messageType: "text",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [activePlatforms, setActivePlatforms] = useState([
    "youtube",
    "twitch",
    "tiktok",
  ]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [viewerCount, setViewerCount] = useState(1247);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Helper function to render platform icons
  const renderPlatformIcon = (platformKey) => {
    const IconComponent = PLATFORMS[platformKey].icon;
    return <IconComponent className="h-3 w-3" />;
  };

  const generateMockMessage = () => {
    if (activePlatforms.length === 0) return null;

    const platform =
      activePlatforms[Math.floor(Math.random() * activePlatforms.length)];
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const message =
      MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];

    return {
      id: Date.now() + Math.random(),
      authorName: user,
      messageText: message,
      platform: platform,
      messageType: "text",
      createdAt: new Date().toISOString(),
    };
  };

  const getAuthorInitials = (authorName) => {
    return authorName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const togglePlatform = (platform) => {
    setActivePlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.length > 1 ? prev.filter((p) => p !== platform) : prev;
      } else {
        return [...prev, platform];
      }
    });
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  // Simulate incoming messages
  useEffect(() => {
    if (!isStreaming) return;

    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.3) {
        // 70% chance of new message
        const newMessage = generateMockMessage();
        if (newMessage) {
          setMessages((prev) => [...prev.slice(-20), newMessage]); // Keep last 20 messages
        }
      }

      // Update viewer count
      setViewerCount((prev) => {
        const change = Math.floor((Math.random() - 0.5) * 20);
        return Math.max(100, Math.min(5000, prev + change));
      });
    }, 2000); // New message every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming, activePlatforms]);

  // Auto-scroll to bottom (contained within the component)
  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 2) {
      // Only scroll if we have more than the initial messages
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Generate initial messages - only run once on mount
  useEffect(() => {
    const initialMessages = [];
    for (let i = 0; i < 6; i++) {
      const message = generateMockMessage();
      if (message) {
        initialMessages.push(message);
      }
    }
    setMessages((prev) => [...prev, ...initialMessages]);
  }, []); // Empty dependency array - only run once

  return (
    <Card className="h-[500px] flex flex-col bg-white text-black border-0 rounded-xl overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0 bg-white ">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-primary" />
            Live Chat
          </span>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="flex items-center text-xs bg-white border-gray-300 text-gray-700"
            >
              <Users className="h-3 w-3 mr-1" />
              {viewerCount.toLocaleString()}
            </Badge>
            <Button
              size="sm"
              variant={isStreaming ? "destructive" : "default"}
              onClick={toggleStreaming}
              className="h-7 px-2"
            >
              {isStreaming ? (
                <Square className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Unified chat from all connected platforms
        </CardDescription>
      </CardHeader>

      {/* Platform Toggle Controls */}
      <div className="px-4 pb-3  border-gray-600 bg-white">
        <div className="text-xs font-medium text-gray-600 mb-2">
          Active Platforms
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLATFORMS).map(([key, platform]) => (
            <button
              key={key}
              onClick={() => togglePlatform(key)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                activePlatforms.includes(key)
                  ? platform.color
                  : "bg-gray-300 text-gray-600 border-gray-200 hover:bg-gray-100 border-0"
              }`}
            >
              {renderPlatformIcon(key)}
              <span>{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 relative">
        {/* Chat Messages Area */}

        <div className="top-0 z-10 absolute w-full h-3 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-y-auto p-4 space-y-3 bg-gray-50 "
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {isStreaming ? "Waiting for Messages" : "Stream Paused"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {isStreaming
                    ? "Messages will appear here when viewers chat"
                    : "Start streaming to see chat messages"}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <Avatar className="h-8 w-8 bg-gray-200">
                  <AvatarFallback className="text-xs text-gray-600">
                    {getAuthorInitials(message.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {message.authorName}
                    </span>
                    {message.platform && (
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${PLATFORMS[message.platform].color} flex items-center gap-1 border-0`}
                      >
                        {renderPlatformIcon(message.platform)}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm break-words text-gray-700">
                    {message.messageText}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveChatSimulator;
