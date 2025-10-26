import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MessageCircle, Users } from "lucide-react";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.neustream.app";

function LiveChat({ sourceId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch initial chat messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["chatMessages", sourceId],
    queryFn: async () => {
      const response = await apiService.get(
        `/chat/sources/${sourceId}/messages`
      );
      return response;
    },
    enabled: !!sourceId,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!sourceId || !user) return;

    // Initialize socket connection
    const socket = io(API_BASE_URL || "https://api.neustream.app", {
      auth: {
        token: JSON.stringify({
          id: user.id,
          displayName: user.displayName,
          email: user.email,
        }),
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to chat server");
      setIsConnected(true);

      // Join the chat room for this source
      socket.emit("join_chat", { sourceId });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from chat server");
      setIsConnected(false);
    });

    socket.on("joined_chat", (data) => {
      console.log("Joined chat room:", data);
    });

    socket.on("chat_history", (data) => {
      console.log("Received chat history:", data.messages.length);
      setMessages(data.messages || []);
    });

    socket.on("new_message", (message) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("error", (error) => {
      console.error("Chat error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_chat", { sourceId });
        socketRef.current.disconnect();
      }
    };
  }, [sourceId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize messages from API
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  const getPlatformColor = (platform) => {
    const colors = {
      twitch: "bg-purple-100 text-purple-800 border-purple-200",
      youtube: "bg-red-100 text-red-800 border-red-200",
      facebook: "bg-blue-100 text-blue-800 border-blue-200",
      custom: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[platform] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getAuthorInitials = (authorName) => {
    return authorName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitch: "🎮",
      youtube: "📺",
      facebook: "📘",
      custom: "🔗",
    };
    return icons[platform] || "💬";
  };

  if (messagesLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-primary" />
            Live Chat
          </CardTitle>
          <CardDescription>Loading chat messages...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-primary" />
            Live Chat
          </span>
          <div className="flex items-center space-x-2">
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-green-500" : ""}
            >
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
            <Badge variant="outline" className="flex items-center text-xs">
              <Users className="h-3 w-3 mr-1" />
              {viewerCount}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time chat from all connected platforms
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 relative">
        {/* Chat Messages Area - Fixed height container */}
        <div className="absolute inset-0 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect chat platforms to see messages here
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials(message.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.authorName}
                    </span>
                    {message.platform && (
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${getPlatformColor(
                          message.platform
                        )}`}
                      >
                        {getPlatformIcon(message.platform)} {message.platform}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{message.messageText}</p>
                  {message.messageType !== "text" && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {message.messageType}
                    </Badge>
                  )}
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

export default LiveChat;
