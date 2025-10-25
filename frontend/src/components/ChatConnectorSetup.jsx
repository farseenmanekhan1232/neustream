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
      const response = await apiService.get(`/chat/connectors/${platform}/oauth/start`, {
        sourceId,
        redirectUrl: `${window.location.origin}/dashboard/streaming`,
      });
      return response;
    },
    onSuccess: (data) => {
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
    if (connector) {
      return {
        status: "connected",
        connector,
      };
    }
    const platform = PLATFORMS.find((p) => p.id === platformId);
    return {
      status: platform?.status || "unavailable",
      connector: null,
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
        <CardTitle className="flex items-center justify-between">
          <span>Chat Connectors</span>
          <Badge variant="outline">
            {connectors.length} / {PLATFORMS.filter(p => p.status === "available").length} Connected
          </Badge>
        </CardTitle>
        <CardDescription>
          Connect your streaming platform chats to aggregate messages in your stream preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Connections */}
        {connectors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Active Connections</h4>
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">
                      {PLATFORMS.find((p) => p.id === connector.platform)?.icon || "🔗"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium capitalize">
                      {connector.platform}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {connector.is_active ? (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnectPlatform(connector.id)}
                  disabled={deleteConnectorMutation.isLoading}
                >
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Available Platforms */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Available Platforms</h4>
          {PLATFORMS.map((platform) => {
            const { status, connector } = getPlatformStatus(platform.id);

            return (
              <div
                key={platform.id}
                className={`p-4 border rounded-lg ${
                  status === "connected"
                    ? "bg-green-50 border-green-200"
                    : status === "coming-soon"
                    ? "bg-muted/50 border-muted"
                    : "bg-background border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{platform.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{platform.name}</h4>
                        {status === "connected" && (
                          <Badge variant="default" className="bg-green-500 text-xs">
                            Connected
                          </Badge>
                        )}
                        {status === "coming-soon" && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {platform.description}
                      </p>
                      <div className="space-y-1">
                        {platform.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-xs text-muted-foreground"
                          >
                            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {status === "available" && !connector && (
                      <Button
                        size="sm"
                        onClick={() => handleConnectPlatform(platform.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Button>
                    )}
                    {status === "connected" && connector && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectPlatform(connector.id)}
                        disabled={deleteConnectorMutation.isLoading}
                      >
                        Disconnect
                      </Button>
                    )}
                    {status === "coming-soon" && (
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
            <strong>How it works:</strong> Connect your streaming platform accounts to aggregate
            all chat messages in your stream preview. Messages will appear in real-time as they
            come in from each platform.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatConnectorSetup;