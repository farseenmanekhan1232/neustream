import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Radio,
  Youtube,
  Twitch,
  Facebook,
  Copy,
  Check,
  Trash2,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  MonitorSpeaker,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DestinationsSkeleton } from "@/components/LoadingSkeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import { apiService } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";

// Platform configuration
const platformConfig = {
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-500",
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    description: "YouTube Live Streaming",
    helpUrl: "https://support.google.com/youtube/answer/2907883",
  },
  twitch: {
    name: "Twitch",
    icon: Twitch,
    color: "bg-purple-500",
    rtmpUrl: "rtmp://live.twitch.tv/app",
    description: "Twitch Live Streaming",
    helpUrl: "https://help.twitch.tv/s/article/broadcast-guidelines",
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-500",
    rtmpUrl: "rtmp://live-api-s.facebook.com:80/rtmp",
    description: "Facebook Live Streaming",
    helpUrl: "https://www.facebook.com/business/help/1968268143233387",
  },
  custom: {
    name: "Custom RTMP",
    icon: Radio,
    color: "bg-gray-500",
    rtmpUrl: "",
    description: "Custom RTMP Server",
    helpUrl: null,
  },
};

function DestinationsManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [newDestination, setNewDestination] = useState({
    platform: "youtube",
    rtmpUrl: platformConfig.youtube.rtmpUrl,
    streamKey: "",
  });
  const [searchParams] = useSearchParams();
  const { trackUIInteraction, trackDestinationEvent } = usePostHog();

  // Get source ID from URL params if provided
  const urlSourceId = searchParams.get("source");

  // Fetch stream sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["streamSources", user?.id],
    queryFn: async () => {
      const response = await apiService.get("/sources");
      return response;
    },
    enabled: !!user,
  });

  // Fetch destinations for selected source
  const { data: sourceDestinationsData, isLoading: sourceDestinationsLoading } =
    useQuery({
      queryKey: ["sourceDestinations", selectedSourceId],
      queryFn: async () => {
        if (!selectedSourceId) return { destinations: [] };
        const response = await apiService.get(`/sources/${selectedSourceId}`);
        return response;
      },
      enabled: !!user && !!selectedSourceId,
    });

  // Fetch legacy destinations (backward compatibility)
  const { data: legacyDestinationsData, isLoading: legacyDestinationsLoading } =
    useQuery({
      queryKey: ["legacyDestinations", user?.id],
      queryFn: async () => {
        const response = await apiService.get("/destinations");
        return response;
      },
      enabled:
        !!user && (!selectedSourceId || sourcesData?.sources?.length === 0),
    });

  const sources = sourcesData?.sources || [];
  const sourceDestinations = sourceDestinationsData?.destinations || [];
  const legacyDestinations = legacyDestinationsData?.destinations || [];

  // Auto-select first source if available and no source is selected
  useEffect(() => {
    if (sources.length > 0 && !selectedSourceId && !urlSourceId) {
      setSelectedSourceId(sources[0].id);
    } else if (urlSourceId) {
      setSelectedSourceId(urlSourceId);
    }
  }, [sources, selectedSourceId, urlSourceId]);

  // Get the current destinations based on what's selected
  const destinations = selectedSourceId
    ? sourceDestinations
    : legacyDestinations;
  const currentSource = sources.find((s) => s.id === selectedSourceId);
  const isUsingSources = sources.length > 0;

  // Add destination mutation
  const addDestinationMutation = useMutation({
    mutationFn: async (destination) => {
      let response;

      if (selectedSourceId) {
        // Add destination to specific source
        response = await apiService.post(
          `/sources/${selectedSourceId}/destinations`,
          destination,
        );
      } else {
        // Legacy destination (user-level)
        response = await apiService.post("/destinations", destination);
      }

      return response;
    },
    onSuccess: (data) => {
      // Track destination addition
      trackDestinationEvent(data.destination.id, "destination_added", {
        platform: newDestination.platform,
        rtmp_url: newDestination.rtmpUrl,
        source_id: selectedSourceId,
        source_name: currentSource?.name,
      });
      setNewDestination({
        platform: "youtube",
        rtmpUrl: platformConfig.youtube.rtmpUrl,
        streamKey: "",
      });
      setShowAddForm(false);

      // Invalidate appropriate queries
      if (selectedSourceId) {
        queryClient.invalidateQueries(["sourceDestinations", selectedSourceId]);
      } else {
        queryClient.invalidateQueries(["legacyDestinations", user?.id]);
      }

      toast.success("Destination added successfully!");
    },
    onError: (error) => {
      // Track destination addition failure
      trackDestinationEvent(null, "destination_add_failed", {
        platform: newDestination.platform,
        error: error.message,
        source_id: selectedSourceId,
      });
      toast.error(error.message);
    },
  });

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: async (id) => {
      let response;

      if (selectedSourceId) {
        // Delete destination from specific source
        response = await apiService.delete(
          `/sources/${selectedSourceId}/destinations/${id}`,
        );
      } else {
        // Legacy destination deletion
        response = await apiService.delete(`/destinations/${id}`);
      }

      return response;
    },
    onSuccess: (_, id) => {
      // Track destination removal
      trackDestinationEvent(id, "destination_removed", {
        source_id: selectedSourceId,
        source_name: currentSource?.name,
      });

      // Invalidate appropriate queries
      if (selectedSourceId) {
        queryClient.invalidateQueries(["sourceDestinations", selectedSourceId]);
      } else {
        queryClient.invalidateQueries(["legacyDestinations", user?.id]);
      }

      toast.success("Destination removed successfully!");
    },
    onError: (error, id) => {
      // Track destination removal failure
      trackDestinationEvent(id, "destination_remove_failed", {
        error: error.message,
        source_id: selectedSourceId,
      });
      toast.error(error.message);
    },
  });

  // Copy to clipboard function
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      // Track copy actions
      trackUIInteraction(
        `copy_${field.toLowerCase().replace(/\s+/g, "_")}`,
        "click",
        {
          field_type: field,
          content_length: text.length,
        },
      );
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Handle platform selection change
  const handlePlatformChange = (platform) => {
    const config = platformConfig[platform];
    setNewDestination({
      ...newDestination,
      platform,
      rtmpUrl: config.rtmpUrl,
    });
    // Track platform selection
    trackUIInteraction("platform_selection", "change", {
      selected_platform: platform,
    });
  };

  const handleAddDestination = (e) => {
    e.preventDefault();
    // Track form submission
    trackUIInteraction("add_destination_form", "submit", {
      platform: newDestination.platform,
    });
    addDestinationMutation.mutate(newDestination);
  };

  // Early return if user is not available (after all hooks are called)
  if (!user) {
    return <DestinationsSkeleton />;
  }

  const isLoading =
    sourcesLoading || sourceDestinationsLoading || legacyDestinationsLoading;

  if (isLoading) {
    return <DestinationsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-normal">Streaming Destinations</div>
          <p className="text-muted-foreground">
            {isUsingSources
              ? `Manage destinations for ${currentSource?.name || "selected source"}`
              : "Manage your connected platforms and streaming endpoints"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Source Selection */}
          {isUsingSources && (
            <Select
              value={selectedSourceId || ""}
              onValueChange={setSelectedSourceId}
            >
              <SelectTrigger className="w-48">
                <div className="flex items-center gap-2">
                  <MonitorSpeaker className="h-4 w-4" />
                  <SelectValue placeholder="Select source" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center gap-2">
                      <MonitorSpeaker className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {source.destinations_count} destination
                          {source.destinations_count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Add Destination Button */}
          {destinations.length > 0 && !showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Destination
            </Button>
          )}
        </div>
      </div>

      {/* Source Info Card */}
      {isUsingSources && currentSource && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MonitorSpeaker className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{currentSource.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentSource.description || "No description"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {currentSource.destinations_count} destination
                    {currentSource.destinations_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-muted-foreground">
                    Created{" "}
                    {new Date(currentSource.created_at).toLocaleDateString()}
                  </span>
                  {currentSource.is_active && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy User Warning */}
      {!isUsingSources && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-medium text-orange-700">
                  Legacy Destination Management
                </h3>
                <p className="text-sm text-orange-600 mt-1">
                  You're using the legacy destination system. Consider creating
                  stream sources for better organization and multi-source
                  streaming capabilities.
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/dashboard/sources">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Stream Sources
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Destination Form */}
      {showAddForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Add New Destination</CardTitle>
            <CardDescription>
              Connect a new streaming platform to broadcast your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDestination} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Platform Selection */}
                <div className="space-y-4">
                  <Label>Select Platform</Label>
                  <div className="grid lg:grid-cols-2 gap-3">
                    {Object.entries(platformConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      const isSelected = newDestination.platform === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePlatformChange(key)}
                          className={`relative p-4 border rounded-lg text-left transition-all group ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${config.color} text-white group-hover:scale-105 transition-transform`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {config.description}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute text-sm font-medium right-1 top-1 text-green-700">
                              ✓ Selected
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <Label>Configuration</Label>

                  {/* RTMP URL */}
                  <div className="space-y-2">
                    <Label htmlFor="rtmpUrl" className="text-sm">
                      RTMP URL
                    </Label>
                    <div className="relative">
                      <Input
                        id="rtmpUrl"
                        type="text"
                        value={newDestination.rtmpUrl}
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            rtmpUrl: e.target.value,
                          })
                        }
                        placeholder="rtmp://..."
                        required
                        className="font-mono text-sm pr-10"
                        disabled={newDestination.platform !== "custom"}
                      />
                      {newDestination.rtmpUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(newDestination.rtmpUrl, "RTMP URL")
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {newDestination.platform !== "custom" && (
                      <p className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                        Auto-filled for{" "}
                        {platformConfig[newDestination.platform].name}
                      </p>
                    )}
                  </div>

                  {/* Stream Key */}
                  <div className="space-y-2">
                    <Label htmlFor="streamKey" className="text-sm">
                      Stream Key
                    </Label>
                    <Input
                      id="streamKey"
                      type="text"
                      value={newDestination.streamKey}
                      onChange={(e) =>
                        setNewDestination({
                          ...newDestination,
                          streamKey: e.target.value,
                        })
                      }
                      placeholder="Paste your stream key here"
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this from your{" "}
                      {platformConfig[newDestination.platform].name} streaming
                      dashboard
                      {platformConfig[newDestination.platform].helpUrl && (
                        <a
                          href={platformConfig[newDestination.platform].helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline ml-1"
                        >
                          <ExternalLink className="h-3 w-3 inline mr-1" />
                          Learn how
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addDestinationMutation.isPending ||
                    !newDestination.streamKey
                  }
                >
                  {addDestinationMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Destination"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Destinations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => {
          const config =
            platformConfig[destination.platform] || platformConfig.custom;
          const Icon = config.icon;

          return (
            <Card
              key={destination.id}
              className="group hover:border-primary/50 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={destination.is_active ? "default" : "secondary"}
                >
                  {destination.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    RTMP URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-2 bg-muted rounded-md font-mono text-xs border truncate">
                      {destination.rtmp_url}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          destination.rtmp_url,
                          `${config.name} RTMP URL`,
                        )
                      }
                      className="h-8 w-8"
                    >
                      {copiedField === `${config.name} RTMP URL` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteDestinationMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Destination</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove the {config.name}{" "}
                          destination? This action cannot be undone. You will
                          need to re-add the destination with your stream key if
                          you want to use it again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteDestinationMutation.mutate(destination.id)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove Destination
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {config.helpUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={config.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Help
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {destinations.length === 0 && !showAddForm && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isUsingSources
                ? `No destinations for ${currentSource?.name || "this source"}`
                : "No destinations configured"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isUsingSources
                ? `Add streaming platforms to ${currentSource?.name || "this source"} to start broadcasting to multiple destinations.`
                : "Add your first streaming platform to start broadcasting to multiple destinations simultaneously."}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {isUsingSources
                ? `Add Destination to ${currentSource?.name || "Source"}`
                : "Add Your First Destination"}
            </Button>
            {!isUsingSources && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Or create stream sources for better organization:</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/dashboard/sources">
                    <MonitorSpeaker className="h-4 w-4 mr-2" />
                    Create Stream Sources
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DestinationsManager;
