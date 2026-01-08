import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { apiService } from "../services/api";
import { subscriptionService } from "../services/subscription";
import {
  Twitch,
  Youtube,
  Crown,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  {
    id: "twitch",
    name: "Twitch",
    description: "Connect to your Twitch channel chat",
    icon: Twitch,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    status: "available",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Connect to your YouTube Live chat",
    icon: Youtube,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    status: "available",
  },
];

interface ChatConnectorSetupProps {
  sourceId: string;
  sourceName?: string;
}

export default function ChatConnectorSetup({ sourceId }: ChatConnectorSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectorToDelete, setConnectorToDelete] = useState<string | null>(null);
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

  // Check chat connector limits
  const { data: chatConnectorLimits, isLoading: limitsLoading } = useQuery({
    queryKey: ["chatConnectorLimits"],
    queryFn: async () => {
      return await subscriptionService.canCreateChatConnector();
    },
  });

  const connectors = (connectorsData as any)?.connectors || [];
  
  const canCreateConnector = (chatConnectorLimits as any)?.allowed ?? true;
  const currentConnectors = (chatConnectorLimits as any)?.current ?? connectors.length;
  const maxConnectors = (chatConnectorLimits as any)?.max ?? 1;

  // Mutation for starting OAuth flow
  const startOAuthMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await apiService.get(
        `/chat/connectors/${platform}/oauth/start`,
        {
          sourceId,
          redirectUrl: `${window.location.origin}/dashboard/streaming`,
        },
      );
      return response;
    },
    onSuccess: (data: any) => {
      toast.loading("Redirecting to authentication...", { duration: 2000 });
      window.location.href = data.oauthUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start connection process");
      setIsConnecting(false);
    },
  });

  // Mutation for deleting connector
  const deleteConnectorMutation = useMutation({
    mutationFn: async (connectorId: string) => {
      await apiService.delete(`/chat/connectors/${connectorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatConnectors", sourceId] });
      queryClient.invalidateQueries({ queryKey: ["chatConnectorLimits"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionUsage"] });
      toast.success("Chat connector disconnected");
      setConnectorToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to disconnect");
    }
  });

  const handleConnectPlatform = async (platform: string) => {
    if (!canCreateConnector) {
      toast.error(
        `Limit reached (${currentConnectors}/${maxConnectors}). Upgrade your plan to add more.`,
        {
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = "/dashboard/subscription"
          }
        }
      );
      return;
    }

    setIsConnecting(true);
    try {
      await startOAuthMutation.mutateAsync(platform);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const getPlatformStatus = (platformId: string) => {
    const connector = connectors.find((c: any) => c.platform === platformId);
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

  const isLoading = connectorsLoading || limitsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 p-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Connectors
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Connectors
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregate chat messages from your streaming platforms.
          </p>
        </div>
        
        {/* Usage Badge */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
          canCreateConnector 
            ? "bg-primary/5 text-primary border-primary/20" 
            : "bg-orange-500/10 text-orange-500 border-orange-500/20"
        )}>
          <Crown className="h-3 w-3" />
          <span>{currentConnectors} / {maxConnectors} Active</span>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 xl:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const { status, connector } = getPlatformStatus(platform.id);
          const isConnected = status === "connected";
          
          return (
            <div
              key={platform.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                isConnected
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card/30 border-border/40 hover:bg-card/50 hover:border-border/60"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  platform.bgColor
                )}>
                  <platform.icon className={cn("h-5 w-5", platform.color)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{platform.name}</span>
                    {isConnected && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isConnected 
                      ? "Chat messages are being synced" 
                      : platform.description}
                  </p>
                </div>
              </div>

              <div>
                {isConnected ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setConnectorToDelete(connector.id)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConnectPlatform(platform.id)}
                    disabled={isConnecting || !canCreateConnector}
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={!!connectorToDelete} onOpenChange={(open) => !open && setConnectorToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Chat?</DialogTitle>
            <DialogDescription>
              This will stop syncing chat messages from this platform. You can reconnect at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectorToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => connectorToDelete && deleteConnectorMutation.mutate(connectorToDelete)}
              disabled={deleteConnectorMutation.isPending}
            >
              {deleteConnectorMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
