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
  rawMode = false,
}) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [hasReceivedWebSocketMessages, setHasReceivedWebSocketMessages] =
    useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const systemMessageCache = useRef(new Map());
  const messageIdsRef = useRef(new Set());
  const currentSourceIdRef = useRef(null);
  const userColorCache = useRef(new Map());

  // Fetch initial chat messages from public endpoint
  useEffect(() => {
    if (!sourceId) return;

    const fetchPublicMessages = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chat/public/sources/${sourceId}/messages`,
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
    if (
      socketRef.current?.connected &&
      currentSourceIdRef.current === sourceId
    ) {
      return;
    }

    // Clean up previous connection if source changed
    if (socketRef.current && currentSourceIdRef.current !== sourceId) {
      socketRef.current.emit("leave_chat", {
        sourceId: currentSourceIdRef.current,
      });
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
        socketRef.current.emit("leave_chat", {
          sourceId: currentSourceIdRef.current,
        });
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

  const getUserColor = (authorName) => {
    if (userColorCache.current.has(authorName)) {
      return userColorCache.current.get(authorName);
    }

    const colors = [
      "text-red-500",
      "text-blue-500",
      "text-green-500",
      "text-purple-500",
      "text-yellow-500",
      "text-pink-500",
      "text-indigo-500",
      "text-orange-500",
      "text-teal-500",
      "text-cyan-500",
      "text-lime-500",
      "text-emerald-500",
      "text-violet-500",
      "text-fuchsia-500",
      "text-rose-500",
      "text-sky-500",
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    userColorCache.current.set(authorName, randomColor);
    return randomColor;
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitch: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      ),
      youtube: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      facebook: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      custom: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
      ),
    };
    return (
      icons[platform] || (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      )
    );
  };

  // Helper function to add messages with deduplication
  const addMessagesWithDeduplication = (newMessages) => {
    if (!Array.isArray(newMessages)) {
      newMessages = [newMessages];
    }

    setMessages((prev) => {
      const filteredMessages = newMessages.filter(
        (message) => message.id && !messageIdsRef.current.has(message.id),
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
    if (message.messageType !== "system" || message.authorName !== "System") {
      return true;
    }

    const messageText = message.messageText;

    const connectionPatterns = [
      {
        pattern: /connected to.*youtube chat.*via real-time grpc streaming/i,
        platform: "youtube",
        type: "grpc",
      },
      {
        pattern: /connected to.*youtube chat.*via real-time streaming/i,
        platform: "youtube",
        type: "streaming",
      },
      {
        pattern: /connected to.*twitch chat/i,
        platform: "twitch",
        type: "irc",
      },
    ];

    const connectionInfo = connectionPatterns.find(({ pattern }) =>
      pattern.test(messageText),
    );

    if (connectionInfo) {
      const cacheKey = `system_connection_${connectionInfo.platform}`;
      const now = Date.now();
      const lastSeen = systemMessageCache.current.get(cacheKey);

      if (lastSeen && now - lastSeen < 300000) {
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
    ? `h-full overflow-y-auto space-y-1 ${transparent ? "" : "p-4"}`
    : "absolute inset-0 overflow-y-auto p-4 space-y-1";

  const messageClass = rawMode ? "flex space-x-3" : "flex space-x-3";

  const getAuthorClass = (authorName, rawMode) => {
    const baseClass = rawMode ? "text-lg font-medium" : "text-lg font-medium";
    return `${baseClass} ${getUserColor(authorName)}`;
  };

  const messageTextClass = rawMode
    ? "text-lg break-words text-white"
    : "text-lg break-words";

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
          messages.filter(shouldShowSystemMessage).map((message) => (
            <div key={message.id} className={messageClass}>
              <div className="flex items-center space-x-2">
                {message.platform && (
                  <span className="text-gray-400">
                    {getPlatformIcon(message.platform)}
                  </span>
                )}
                <span className={getAuthorClass(message.authorName, true)}>
                  {message.authorName}:
                </span>
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
        messages.filter(shouldShowSystemMessage).map((message) => (
          <div key={message.id} className={messageClass}>
            <div className="flex items-start justify-start space-x-1">
              {message.platform && (
                <span className="text-muted-foreground">
                  {getPlatformIcon(message.platform)}
                </span>
              )}
              <span className={getAuthorClass(message.authorName, false)}>
                {message.authorName}:
              </span>
              <p className={messageTextClass}>{message.messageText}</p>
              {message.messageType !== "text" && (
                <Badge variant="secondary" className="text-lg">
                  {message.messageType}
                </Badge>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default PublicChat;
