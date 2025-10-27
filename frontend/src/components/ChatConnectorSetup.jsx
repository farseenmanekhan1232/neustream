import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { apiService } from "../services/api";

const PLATFORMS = [
  {
    id: "twitch",
    name: "Twitch",
    description: "Connect to your Twitch channel chat",
    icon: "🎮",
    status: "available",
    features: ["Real-time chat messages", "Subscriptions & bits", "Emotes support"],
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Connect to your YouTube Live chat",
    icon: "📺",
    status: "available",
    features: ["Live chat messages", "Super Chat support", "Emoji reactions"],
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Connect to your Instagram Live comments",
    icon: "📸",
    status: "available",
    features: ["Live comments", "Reactions", "Real-time streaming"],
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Connect to your Facebook Live comments",
    icon: "📘",
    status: "coming-soon",
    features: ["Live comments", "Reactions", "Comment moderation"],
  },
  {
    id: "custom",
    name: "Custom",
    description: "Connect custom chat via webhooks",
    icon: "🔧",
    status: "coming-soon",
    features: ["Webhook integration", "Custom formatting", "Flexible setup"],
  },
];

function ChatConnectorSetup({ sourceId, sourceName }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch existing chat connectors for this source
  const { data: connectorsData, isLoading: connectorsLoading } = useQuery({
    queryKey: ["chatConnectors", sourceId],
    queryFn: async () => {
      const response = await apiService.get(`/chat/sources/${sourceId}/connectors`);
      return response;
    },
    enabled: !!sourceId,
  });

  const connectors = connectorsData?.connectors || [];

  // Mutation for starting OAuth flow
  const startOAuthMutation = useMutation({
    mutationFn: async (platform) => {
      console.log("Starting OAuth for platform:", platform, "sourceId:", sourceId);
      const response = await apiService.get(`/chat/connectors/${platform}/oauth/start`, {
        sourceId,
        redirectUrl: `${window.location.origin}/dashboard/streaming`,
      });
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
      platform
    };
  };

  if (connectorsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat Connectors</CardTitle>
          <CardDescription>
            Connect your streaming platform chats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Connectors</CardTitle>
        <CardDescription>
          Connect your streaming platform chats to aggregate messages in your stream preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Grid */}
        <div className="grid gap-3">
          {PLATFORMS.map((platform) => {
            const { status, connector } = getPlatformStatus(platform.id);
            const isConnected = status === "connected";
            const isAvailable = status === "available";
            const isComingSoon = status === "coming-soon";

            return (
              <div
                key={platform.id}
                className={`p-4 border rounded-lg transition-colors ${
                  isConnected
                    ? "bg-green-50 border-green-200"
                    : isComingSoon
                    ? "bg-muted/50 border-muted"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl">{platform.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{platform.name}</h4>
                        {isConnected && (
                          <Badge variant="default" className="bg-green-500 text-xs">
                            Connected
                          </Badge>
                        )}
                        {isComingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAvailable && !isConnected && (
                      <Button
                        size="sm"
                        onClick={() => handleConnectPlatform(platform.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Button>
                    )}
                    {isConnected && connector && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectPlatform(connector.id)}
                        disabled={deleteConnectorMutation.isLoading}
                      >
                        Disconnect
                      </Button>
                    )}
                    {isComingSoon && (
                      <Button variant="outline" size="sm" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            Connect your streaming platform accounts to aggregate chat messages in your stream preview.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatConnectorSetup;