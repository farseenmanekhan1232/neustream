import { useState, useEffect, useRef } from "react";
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.neustream.app";

function PublicChat({
  sourceId,
  showHeader = true,
  backgroundColor = "default",
  transparent = false,
  rawMode = false
}) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [hasReceivedWebSocketMessages, setHasReceivedWebSocketMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const systemMessageCache = useRef(new Map());
  const messageIdsRef = useRef(new Set());
  const currentSourceIdRef = useRef(null);

  // Fetch initial chat messages from public endpoint
  useEffect(() => {
    if (!sourceId) return;

    const fetchPublicMessages = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chat/public/sources/${sourceId}/messages`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }

        const data = await response.json();
        setMessagesWithTracking(data.messages || []);
      } catch (error) {
        console.error("Failed to fetch public chat messages:", error);
      }
    };

    fetchPublicMessages();
  }, [sourceId]);

  // Initialize WebSocket connection (public access)
  useEffect(() => {
    if (!sourceId) return;

    // Prevent reconnection if we're already connected to the same source
    if (socketRef.current?.connected && currentSourceIdRef.current === sourceId) {
      return;
    }

    // Clean up previous connection if source changed
    if (socketRef.current && currentSourceIdRef.current !== sourceId) {
      socketRef.current.emit("leave_chat", { sourceId: currentSourceIdRef.current });
      socketRef.current.disconnect();
      socketRef.current = null;
      setMessages([]);
      messageIdsRef.current.clear();
      setHasReceivedWebSocketMessages(false);
    }

    // Initialize socket connection with public access
    const socket = io(API_BASE_URL || "https://api.neustream.app", {
      auth: {
        sourceId: sourceId, // Public access using sourceId only
      },
    });

    socketRef.current = socket;
    currentSourceIdRef.current = sourceId;

    socket.on("connect", () => {
      console.log("Connected to public chat server");
      setIsConnected(true);

      // Join the chat room for this source
      socket.emit("join_chat", { sourceId });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from public chat server");
      setIsConnected(false);
    });

    socket.on("joined_chat", (data) => {
      console.log("Joined public chat room:", data);
    });

    socket.on("chat_history", (data) => {
      console.log("Received public chat history:", data.messages?.length);
      setMessagesWithTracking(data.messages || []);
      setHasReceivedWebSocketMessages(true);
    });

    socket.on("new_message", (message) => {
      console.log("New public message received:", message);
      addMessagesWithDeduplication(message);
      setHasReceivedWebSocketMessages(true);
    });

    socket.on("error", (error) => {
      console.error("Public chat error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_chat", { sourceId: currentSourceIdRef.current });
        socketRef.current.disconnect();
        socketRef.current = null;
        currentSourceIdRef.current = null;
      }
    };
  }, [sourceId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Helper function to add messages with deduplication
  const addMessagesWithDeduplication = (newMessages) => {
    if (!Array.isArray(newMessages)) {
      newMessages = [newMessages];
    }

    setMessages((prev) => {
      const filteredMessages = newMessages.filter(
        (message) => message.id && !messageIdsRef.current.has(message.id)
      );

      if (filteredMessages.length === 0) {
        return prev;
      }

      filteredMessages.forEach((message) => {
        if (message.id) {
          messageIdsRef.current.add(message.id);
        }
      });

      return [...prev, ...filteredMessages];
    });
  };

  // Helper function to set messages and track their IDs
  const setMessagesWithTracking = (newMessages) => {
    if (!Array.isArray(newMessages)) {
      newMessages = [];
    }

    messageIdsRef.current.clear();

    newMessages.forEach((message) => {
      if (message.id) {
        messageIdsRef.current.add(message.id);
      }
    });

    setMessages(newMessages);
  };

  // Filter repetitive system connection messages
  const shouldShowSystemMessage = (message) => {
    if (message.messageType !== 'system' || message.authorName !== 'System') {
      return true;
    }

    const messageText = message.messageText;

    const connectionPatterns = [
      { pattern: /connected to.*youtube chat.*via real-time grpc streaming/i, platform: 'youtube', type: 'grpc' },
      { pattern: /connected to.*youtube chat.*via real-time streaming/i, platform: 'youtube', type: 'streaming' },
      { pattern: /connected to.*twitch chat/i, platform: 'twitch', type: 'irc' }
    ];

    const connectionInfo = connectionPatterns.find(({ pattern }) =>
      pattern.test(messageText)
    );

    if (connectionInfo) {
      const cacheKey = `system_connection_${connectionInfo.platform}`;
      const now = Date.now();
      const lastSeen = systemMessageCache.current.get(cacheKey);

      if (lastSeen && (now - lastSeen) < 300000) {
        return false;
      }

      systemMessageCache.current.set(cacheKey, now);

      const tenMinutesAgo = now - 600000;
      for (const [key, timestamp] of systemMessageCache.current.entries()) {
        if (timestamp < tenMinutesAgo) {
          systemMessageCache.current.delete(key);
        }
      }

      return false;
    }

    return true;
  };

  // Determine container styles based on props
  const containerClass = rawMode
    ? `h-full overflow-y-auto space-y-3 ${transparent ? '' : 'p-4'}`
    : "absolute inset-0 overflow-y-auto p-4 space-y-3";

  const messageClass = rawMode
    ? "flex space-x-3"
    : "flex space-x-3";

  const authorClass = rawMode
    ? "text-sm font-medium text-white"
    : "text-sm font-medium";

  const messageTextClass = rawMode
    ? "text-sm break-words text-white"
    : "text-sm break-words";

  const timeClass = rawMode
    ? "text-xs text-gray-300"
    : "text-xs text-muted-foreground";

  // Render raw mode (minimal styling for OBS)
  if (rawMode) {
    return (
      <div className={containerClass}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <p className="text-gray-400">No messages yet</p>
            </div>
          </div>
        ) : (
          messages
            .filter(shouldShowSystemMessage)
            .map((message) => (
              <div key={message.id} className={messageClass}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={authorClass}>
                      {message.authorName}
                    </span>
                    {message.platform && (
                      <span className="text-xs text-gray-400">
                        [{message.platform}]
                      </span>
                    )}
                    <span className={timeClass}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className={messageTextClass}>{message.messageText}</p>
                </div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  }

  // Render normal mode with card
  return (
    <Card className="h-full flex flex-col">
      {showHeader && (
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
      )}

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 relative">
        <div className={containerClass}>
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
            messages
              .filter(shouldShowSystemMessage)
              .map((message) => (
                <div key={message.id} className={messageClass}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getAuthorInitials(message.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={authorClass}>
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
                      <span className={timeClass}>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className={messageTextClass}>{message.messageText}</p>
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

export default PublicChat;