import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { apiService } from "../services/api";
import { Twitch, Youtube, Instagram, Facebook, Settings } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardTitle } from "./ui/card";

const PLATFORMS = [
  {
    id: "twitch",
    name: "Twitch",
    description: "Connect to your Twitch channel chat",
    icon: Twitch,
    status: "available",
    features: [
      "Real-time chat messages",
      "Subscriptions & bits",
      "Emotes support",
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Connect to your YouTube Live chat",
    icon: Youtube,
    status: "available",
    features: ["Live chat messages", "Super Chat support", "Emoji reactions"],
  },
  // {
  //   id: "instagram",
  //   name: "Instagram",
  //   description: "Connect to your Instagram Live comments",
  //   icon: Instagram,
  //   status: "available",
  //   features: ["Live comments", "Reactions", "Real-time streaming"],
  // },
  // {
  //   id: "facebook",
  //   name: "Facebook",
  //   description: "Connect to your Facebook Live comments",
  //   icon: Facebook,
  //   status: "coming-soon",
  //   features: ["Live comments", "Reactions", "Comment moderation"],
  // },
  // {
  //   id: "custom",
  //   name: "Custom",
  //   description: "Connect custom chat via webhooks",
  //   icon: Settings,
  //   status: "coming-soon",
  //   features: ["Webhook integration", "Custom formatting", "Flexible setup"],
  // },
];

function ChatConnectorSetup({ sourceId, sourceName }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch existing chat connectors for this source
  const { data: connectorsData, isLoading: connectorsLoading } = useQuery({
    queryKey: ["chatConnectors", sourceId],
    queryFn: async () => {
      const response = await apiService.get(
        `/chat/sources/${sourceId}/connectors`,
      );
      return response;
    },
    enabled: !!sourceId,
  });

  const connectors = connectorsData?.connectors || [];

  // Mutation for starting OAuth flow
  const startOAuthMutation = useMutation({
    mutationFn: async (platform) => {
      console.log(
        "Starting OAuth for platform:",
        platform,
        "sourceId:",
        sourceId,
      );
      const response = await apiService.get(
        `/chat/connectors/${platform}/oauth/start`,
        {
          sourceId,
          redirectUrl: `${window.location.origin}/dashboard/streaming`,
        },
      );
      console.log("OAuth start response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("OAuth start success, redirecting to:", data.oauthUrl);
      // Redirect to OAuth URL
      window.location.href = data.oauthUrl;
    },
    onError: (error) => {
      console.error("OAuth start error:", error);
      setIsConnecting(false);
    },
  });

  // Mutation for deleting connector
  const deleteConnectorMutation = useMutation({
    mutationFn: async (connectorId) => {
      await apiService.delete(`/chat/connectors/${connectorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["chatConnectors", sourceId]);
    },
  });

  const handleConnectPlatform = async (platform) => {
    setIsConnecting(true);
    try {
      await startOAuthMutation.mutateAsync(platform);
    } catch (error) {
      console.error("Failed to start OAuth flow:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnectPlatform = async (connectorId) => {
    if (confirm("Are you sure you want to disconnect this chat connector?")) {
      await deleteConnectorMutation.mutateAsync(connectorId);
    }
  };

  const getPlatformStatus = (platformId) => {
    const connector = connectors.find((c) => c.platform === platformId);
    const platform = PLATFORMS.find((p) => p.id === platformId);

    if (connector) {
      return { status: "connected", connector, platform };
    }

    return {
      status: platform?.status || "unavailable",
      connector: null,
      platform,
    };
  };

  if (connectorsLoading) {
    return (
      <div className="space-y-4">
        <div>
          <span className="relative">
            <h3 className="text-lg font-semibold mb-1">Chat Connectors</h3>
            <Badge
              className={
                "absolute right-0 top-0 bg-white text-black rounded-full text-sm"
              }
            >
              beta
            </Badge>
          </span>
          <p className="text-sm text-muted-foreground">
            Connect your streaming platform chats
          </p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardTitle>{""}</CardTitle>
      <CardContent>
        <div className="space-y-4">
          <div>
            <span className="relative">
              <h3 className="text-lg font-semibold mb-1">Chat Connectors</h3>
              <Badge
                className={
                  "absolute right-0 top-0 bg-white text-black rounded-full text-sm"
                }
              >
                beta
              </Badge>
            </span>
            <p className="text-sm text-muted-foreground">
              Connect streaming platforms to aggregate chat messages in your
              stream preview
            </p>
          </div>

          <div className="space-y-2">
            {PLATFORMS.map((platform) => {
              const { status, connector } = getPlatformStatus(platform.id);
              const isConnected = status === "connected";
              const isAvailable = status === "available";
              const isComingSoon = status === "coming-soon";

              return (
                <div
                  key={platform.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isConnected
                      ? "bg-green-50 border-green-200"
                      : isComingSoon
                        ? "bg-muted/30 border-muted"
                        : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <platform.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{platform.name}</span>
                        {isConnected && (
                          <span className="text-xs text-green-600 font-medium">
                            Connected
                          </span>
                        )}
                        {isComingSoon && (
                          <span className="text-xs text-muted-foreground">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  {isAvailable && !isConnected && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnectPlatform(platform.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                  {isConnected && connector && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisconnectPlatform(connector.id)}
                      disabled={deleteConnectorMutation.isLoading}
                    >
                      Disconnect
                    </Button>
                  )}
                  {isComingSoon && (
                    <Button size="sm" variant="ghost" disabled>
                      Soon
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatConnectorSetup;
