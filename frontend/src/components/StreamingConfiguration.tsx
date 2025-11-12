import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Radio,
  Play,
  Pause,
  Settings,
  Copy,
  Zap,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  MonitorSpeaker,
  Youtube,
  Twitch,
  Facebook,
  AlertCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import ChatConnectorSetup from "./ChatConnectorSetup";
import StreamConfig from "./StreamConfig";
import PlatformSelector from "./PlatformSelector";
import DestinationConfig from "./DestinationConfig";

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

function StreamingConfiguration() {
  const { user } = useAuth();
  const { trackUIInteraction, trackDestinationEvent } = usePostHog();
  const queryClient = useQueryClient();
  const [searchParams, _] = useSearchParams();

  // State for UI interactions
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
  const [showSwitchSourceDialog, setShowSwitchSourceDialog] = useState(false);
  const [showManageSourceDialog, setShowManageSourceDialog] = useState(false);
  const [showAddDestinationDialog, setShowAddDestinationDialog] =
    useState(false);
  const [addDestinationStep, setAddDestinationStep] = useState(1); // Step 1: Platform, Step 2: Configuration
  const [copiedField, setCopiedField] = useState(null);

  // Form state
  const [sourceFormData, setSourceFormData] = useState({
    name: "",
    description: "",
  });

  const [destinationFormData, setDestinationFormData] = useState({
    platform: "youtube",
    rtmpUrl: platformConfig.youtube.rtmpUrl,
    streamKey: "",
  });

  // Fetch stream sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["streamSources", user?.id],
    queryFn: async () => {
      const response = await apiService.get("/sources");
      return response;
    },
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch destinations for selected source
  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ["sourceDestinations", selectedSourceId],
    queryFn: async () => {
      if (!selectedSourceId) return { destinations: [] };
      const response = await apiService.get(`/sources/${selectedSourceId}`);
      return response;
    },
    enabled: !!user && !!selectedSourceId,
    refetchInterval: 5000, // Refresh destinations more frequently
  });

  const sources = sourcesData?.sources || [];
  const destinations = destinationsData?.destinations || [];
  const currentSource = sources.find((s) => s.id === selectedSourceId);
  const isUsingSources = sources.length > 0;
  const hasSources = sources.length > 0;

  // Auto-select first source if available and no source is selected
  useEffect(() => {
    if (sources.length > 0 && !selectedSourceId) {
      setSelectedSourceId(sources[0].id);
    } else if (sources.length === 0) {
      setSelectedSourceId(null);
    }
  }, [sources, selectedSourceId]);

  // Handle URL parameter for source selection
  useEffect(() => {
    const urlSourceId = searchParams.get("source");
    if (urlSourceId && sources.find((s) => s.id === urlSourceId)) {
      setSelectedSourceId(urlSourceId);
    }
  }, [searchParams, sources]);

  // Handle OAuth success redirect
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const platform = searchParams.get("platform");

    if (oauthSuccess === "true" && platform && selectedSourceId) {
      // Show success message
      toast.success(
        `${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } account connected successfully!`,
      );

      // Clear the OAuth parameters from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("oauth_success");
      newSearchParams.delete("platform");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${newSearchParams.toString()}`,
      );

      // Refresh the chat connectors query
      queryClient.invalidateQueries(["chatConnectors", selectedSourceId]);
    }
  }, [searchParams, selectedSourceId, queryClient]);

  // Create source mutation
  const createSourceMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiService.post("/sources", data);
      return response;
    },
    onSuccess: (response) => {
      toast.success("Stream source created successfully!");
      setShowAddSourceDialog(false);
      setSourceFormData({ name: "", description: "" });
      queryClient.invalidateQueries(["streamSources"]);

      // Auto-select the new source
      setSelectedSourceId(response.source.id);

      trackUIInteraction("stream_source_created", "click", {
        source_id: response.source.id,
        source_name: response.source.name,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to create stream source",
      );
    },
  });

  // Update source mutation
  const updateSourceMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.put(`/sources/${id}`, data);
      return response;
    },
    onSuccess: () => {
      toast.success("Stream source updated successfully!");
      setShowManageSourceDialog(false);
      queryClient.invalidateQueries(["streamSources"]);

      trackUIInteraction("stream_source_updated", "click", {
        source_id: selectedSourceId,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to update stream source",
      );
    },
  });

  // Delete source mutation
  const deleteSourceMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiService.delete(`/sources/${id}`);
      return response;
    },
    onSuccess: () => {
      toast.success("Stream source deleted successfully!");
      setShowManageSourceDialog(false);
      queryClient.invalidateQueries(["streamSources"]);

      // Select another source if available
      const remainingSources = sources.filter((s) => s.id !== selectedSourceId);
      if (remainingSources.length > 0) {
        setSelectedSourceId(remainingSources[0].id);
      } else {
        setSelectedSourceId(null);
      }

      trackUIInteraction("stream_source_deleted", "click", {
        source_id: selectedSourceId,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to delete stream source",
      );
    },
  });

  // Regenerate stream key mutation
  const regenerateKeyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiService.post(`/sources/${id}/regenerate-key`);
      return response;
    },
    onSuccess: () => {
      toast.success("Stream key regenerated successfully!");
      queryClient.invalidateQueries(["streamSources"]);

      trackUIInteraction("stream_key_regenerated", "click", {
        source_id: selectedSourceId,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to regenerate stream key",
      );
    },
  });

  // Add destination mutation
  const addDestinationMutation = useMutation({
    mutationFn: async (destination) => {
      const response = await apiService.post(
        `/sources/${selectedSourceId}/destinations`,
        destination,
      );
      return response;
    },
    onSuccess: (data) => {
      trackDestinationEvent(data.destination.id, "destination_added", {
        platform: destinationFormData.platform,
        rtmp_url: destinationFormData.rtmpUrl,
        source_id: selectedSourceId,
        source_name: currentSource?.name,
      });

      setDestinationFormData({
        platform: "youtube",
        rtmpUrl: platformConfig.youtube.rtmpUrl,
        streamKey: "",
      });
      setShowAddDestinationDialog(false);

      // Invalidate destinations query
      queryClient.invalidateQueries(["sourceDestinations", selectedSourceId]);

      toast.success("Destination added successfully!");
    },
    onError: (error) => {
      trackDestinationEvent(null, "destination_add_failed", {
        platform: destinationFormData.platform,
        error: error.message,
        source_id: selectedSourceId,
      });
      toast.error(error.response?.data?.error || "Failed to add destination");
    },
  });

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiService.delete(
        `/sources/${selectedSourceId}/destinations/${id}`,
      );
      return response;
    },
    onSuccess: (_, id) => {
      trackDestinationEvent(id, "destination_removed", {
        source_id: selectedSourceId,
        source_name: currentSource?.name,
      });

      // Invalidate destinations query
      queryClient.invalidateQueries(["sourceDestinations", selectedSourceId]);

      toast.success("Destination removed successfully!");
    },
    onError: (error, id) => {
      trackDestinationEvent(id, "destination_remove_failed", {
        error: error.message,
        source_id: selectedSourceId,
      });
      toast.error(
        error.response?.data?.error || "Failed to remove destination",
      );
    },
  });

  // Copy to clipboard function
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);

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

  // Handle copy from StreamConfig component
  const handleStreamConfigCopy = (field, text) => {
    trackUIInteraction(
      `copy_${field.toLowerCase().replace(/\s+/g, "_")}`,
      "click",
      {
        field_type: field,
        content_length: text.length,
      },
    );
  };

  // Handle platform selection change
  const handlePlatformChange = (platform) => {
    const config = platformConfig[platform];
    setDestinationFormData({
      ...destinationFormData,
      platform,
      rtmpUrl: config.rtmpUrl,
    });
    trackUIInteraction("platform_selection", "change", {
      selected_platform: platform,
    });
  };

  // Handle step navigation for Add Destination dialog
  const handleNextStep = () => {
    if (addDestinationStep === 1) {
      setAddDestinationStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (addDestinationStep === 2) {
      setAddDestinationStep(1);
    }
  };

  const handleCloseAddDestinationDialog = () => {
    setShowAddDestinationDialog(false);
    setAddDestinationStep(1);
    setDestinationFormData({
      platform: "youtube",
      rtmpUrl: platformConfig.youtube.rtmpUrl,
      streamKey: "",
    });
  };

  // Handle form submissions
  const handleCreateSource = () => {
    if (!sourceFormData.name.trim()) {
      toast.error("Source name is required");
      return;
    }

    createSourceMutation.mutate({
      name: sourceFormData.name.trim(),
      description: sourceFormData.description.trim(),
    });
  };

  const handleUpdateSource = () => {
    if (!sourceFormData.name.trim()) {
      toast.error("Source name is required");
      return;
    }

    updateSourceMutation.mutate({
      id: selectedSourceId,
      data: {
        name: sourceFormData.name.trim(),
        description: sourceFormData.description.trim(),
        is_active: currentSource.is_active,
      },
    });
  };

  const handleAddDestination = (e) => {
    e.preventDefault();
    trackUIInteraction("add_destination_form", "submit", {
      platform: destinationFormData.platform,
    });
    addDestinationMutation.mutate(destinationFormData);
  };

  const handleDeleteSource = () => {
    if (currentSource.is_active) {
      toast.error("Cannot delete an active stream source");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this stream source? This action cannot be undone and will remove all associated destinations.",
      )
    ) {
      deleteSourceMutation.mutate(selectedSourceId);
    }
  };

  const handleRegenerateKey = () => {
    if (currentSource.is_active) {
      toast.error("Cannot regenerate stream key while source is active");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to regenerate the stream key? Your current stream key will stop working immediately.",
      )
    ) {
      regenerateKeyMutation.mutate(selectedSourceId);
    }
  };

  // Open manage source dialog with current source data
  const openManageSourceDialog = () => {
    if (!currentSource) return;

    setSourceFormData({
      name: currentSource.name,
      description: currentSource.description || "",
    });
    setShowManageSourceDialog(true);
  };
  const isLoading = sourcesLoading || destinationsLoading;

  if (isLoading) {
    return (
      <div className="w-full px-6 py-6 space-y-6  mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse mt-2"></div>
            </div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>

          <div className="space-y-4">
            <div className="h-32 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal">Streaming Configuration</h1>
          <p className="text-muted-foreground">
            Configure your stream sources and destinations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddSourceDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Current Source Selection */}
          {isUsingSources && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MonitorSpeaker className="h-5 w-5 text-primary" />
                      Current Source
                    </CardTitle>
                    <CardDescription>
                      Configure destinations for the selected stream source
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSwitchSourceDialog(true)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Switch Source
                    </Button>
                    <Button variant="outline" onClick={openManageSourceDialog}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentSource ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          currentSource.is_active
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <MonitorSpeaker
                          className={`h-8 w-8 ${
                            currentSource.is_active
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {currentSource.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {currentSource.description || "No description"}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge
                            variant={
                              currentSource.is_active ? "default" : "secondary"
                            }
                          >
                            {currentSource.is_active ? (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Live
                              </>
                            ) : (
                              <>
                                <Pause className="h-3 w-3 mr-1" />
                                Offline
                              </>
                            )}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {destinations.length} destination
                            {destinations.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stream Configuration */}
                    <div className="border-t pt-4">
                      <StreamConfig
                        streamKey={currentSource.stream_key}
                        onCopy={handleStreamConfigCopy}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MonitorSpeaker className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Stream Sources
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first stream source to start configuring
                      destinations
                    </p>
                    <Button onClick={() => setShowAddSourceDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Source
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Destinations Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Destinations</CardTitle>
                  <CardDescription>
                    {isUsingSources
                      ? `Configure platforms for "${
                          currentSource?.name || "selected source"
                        }"`
                      : "Create a stream source first to configure destinations"}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    if (!isUsingSources || !currentSource) {
                      toast.error(
                        "Create a stream source first before adding destinations",
                      );
                      return;
                    }
                    setShowAddDestinationDialog(true);
                  }}
                  disabled={!isUsingSources || !currentSource}
                  title={
                    !isUsingSources || !currentSource
                      ? "Create a stream source first"
                      : "Add destination"
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Destination
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isUsingSources || !currentSource ? (
                <EmptyState
                  icon="source"
                  title="No Stream Source Available"
                  description="Create a stream source first before you can configure destinations for multi-platform broadcasting."
                  actionLabel="Create Your First Source"
                  onAction={() => setShowAddSourceDialog(true)}
                  secondaryActionLabel="Learn More"
                  onSecondaryAction={() => {
                    window.open("/help", "_blank");
                  }}
                />
              ) : destinations.length === 0 ? (
                <EmptyState
                  icon="platform"
                  title="No Destinations Configured"
                  description={`Add streaming platforms to ${currentSource.name} to start broadcasting to multiple destinations.`}
                  actionLabel="Add Your First Destination"
                  onAction={() => {
                    if (!isUsingSources || !currentSource) {
                      toast.error(
                        "Create a stream source first before adding destinations",
                      );
                      return;
                    }
                    setShowAddDestinationDialog(true);
                  }}
                  secondaryActionLabel="View Integration Guide"
                  onSecondaryAction={() => {
                    window.open("/help", "_blank");
                  }}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {destinations.map((destination) => {
                    const config =
                      platformConfig[destination.platform] ||
                      platformConfig.custom;
                    const Icon = config.icon;

                    return (
                      <Card
                        key={destination.id}
                        className="group hover:border-primary/50 transition-colors"
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${config.color} text-white`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {config.name}
                              </CardTitle>
                            </div>
                          </div>
                          <Badge
                            variant={
                              destination.is_active ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {destination.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              RTMP URL
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 text-xs font-mono bg-muted px-2 py-1 rounded truncate">
                                {destination.rtmp_url}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  copyToClipboard(
                                    destination.rtmp_url,
                                    `${config.name} RTMP URL`,
                                  )
                                }
                                className="h-6 w-6"
                              >
                                {copiedField === `${config.name} RTMP URL` ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            {config.helpUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={config.helpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Help
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteDestinationMutation.mutate(destination.id)
                              }
                              disabled={deleteDestinationMutation.isPending}
                              className="text-destructive hover:text-destructive text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          {/* Chat Connectors Section */}
          {isUsingSources && currentSource && (
            <ChatConnectorSetup
              sourceId={currentSource.id}
              sourceName={currentSource.name}
            />
          )}
        </div>
      </div>

      {/* Add Source Dialog */}
      <Dialog open={showAddSourceDialog} onOpenChange={setShowAddSourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stream Source</DialogTitle>
            <DialogDescription>
              Create a new streaming source with its own stream key and
              destinations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Source Name</Label>
              <Input
                id="source-name"
                placeholder="e.g., Main Gaming Stream, Backup Stream, Chat Only"
                value={sourceFormData.name}
                onChange={(e) =>
                  setSourceFormData({ ...sourceFormData, name: e.target.value })
                }
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-description">Description (Optional)</Label>
              <Textarea
                id="source-description"
                placeholder="Describe what this stream source is used for..."
                value={sourceFormData.description}
                onChange={(e) =>
                  setSourceFormData({
                    ...sourceFormData,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddSourceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSource}
              disabled={createSourceMutation.isPending}
            >
              {createSourceMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Create Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch Source Dialog */}
      <Dialog
        open={showSwitchSourceDialog}
        onOpenChange={setShowSwitchSourceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Stream Source</DialogTitle>
            <DialogDescription>
              Select which source to configure destinations for
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  source.id === selectedSourceId
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedSourceId(source.id);
                  setShowSwitchSourceDialog(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        source.is_active ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <MonitorSpeaker
                        className={`h-5 w-5 ${
                          source.is_active ? "text-green-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.destinations_count} destination
                        {source.destinations_count !== 1 ? "s" : ""}
                        {source.is_active && " • Currently Active"}
                      </div>
                    </div>
                  </div>
                  {source.id === selectedSourceId && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setShowSwitchSourceDialog(false);
                setShowAddSourceDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Source
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Source Dialog */}
      <Dialog
        open={showManageSourceDialog}
        onOpenChange={setShowManageSourceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Stream Source</DialogTitle>
            <DialogDescription>
              Modify your stream source settings and configuration
            </DialogDescription>
          </DialogHeader>
          {currentSource && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manage-name">Source Name</Label>
                <Input
                  id="manage-name"
                  value={sourceFormData.name}
                  onChange={(e) =>
                    setSourceFormData({
                      ...sourceFormData,
                      name: e.target.value,
                    })
                  }
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manage-description">Description</Label>
                <Textarea
                  id="manage-description"
                  value={sourceFormData.description}
                  onChange={(e) =>
                    setSourceFormData({
                      ...sourceFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <Badge
                  variant={currentSource.is_active ? "default" : "secondary"}
                >
                  {currentSource.is_active ? "Currently Active" : "Offline"}
                </Badge>
              </div>

              {/* Stream Configuration */}
              <div className="border-t pt-4">
                <StreamConfig
                  streamKey={currentSource.stream_key}
                  showRegenerateButton={true}
                  onRegenerate={() =>
                    regenerateKeyMutation.mutate(selectedSourceId)
                  }
                  isRegenerating={regenerateKeyMutation.isPending}
                  canRegenerate={!currentSource.is_active}
                  size="compact"
                  onCopy={handleStreamConfigCopy}
                />
              </div>

              {/* Danger Zone */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-destructive">
                  Danger Zone
                </Label>
                <div className="mt-2 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateKey}
                    disabled={
                      regenerateKeyMutation.isPending || currentSource.is_active
                    }
                    className="w-full justify-start"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Stream Key
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSource}
                    disabled={
                      deleteSourceMutation.isPending || currentSource.is_active
                    }
                    className="w-full justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Source
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowManageSourceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSource}
              disabled={updateSourceMutation.isPending}
            >
              {updateSourceMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Destination Dialog */}
      <Dialog
        open={showAddDestinationDialog}
        onOpenChange={handleCloseAddDestinationDialog}
      >
        <DialogContent
          className={addDestinationStep === 1 ? "max-w-2xl" : "max-w-md"}
        >
          <DialogHeader>
            <DialogTitle>Add New Destination</DialogTitle>
            <DialogDescription>
              {addDestinationStep === 1
                ? `Select a platform to broadcast "${currentSource?.name || "your stream"}"`
                : `Configure your ${platformConfig[destinationFormData.platform]?.name} destination`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDestination} className="space-y-6">
            {addDestinationStep === 1 ? (
              <PlatformSelector
                platformConfig={platformConfig}
                selectedPlatform={destinationFormData.platform}
                onPlatformChange={handlePlatformChange}
              />
            ) : (
              <DestinationConfig
                platform={destinationFormData.platform}
                rtmpUrl={destinationFormData.rtmpUrl}
                streamKey={destinationFormData.streamKey}
                onRtmpUrlChange={(value) =>
                  setDestinationFormData({
                    ...destinationFormData,
                    rtmpUrl: value,
                  })
                }
                onStreamKeyChange={(value) =>
                  setDestinationFormData({
                    ...destinationFormData,
                    streamKey: value,
                  })
                }
                onCopy={copyToClipboard}
                platformConfig={platformConfig}
                copiedField={copiedField}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={
                  addDestinationStep === 1
                    ? handleCloseAddDestinationDialog
                    : handlePreviousStep
                }
              >
                {addDestinationStep === 1 ? "Cancel" : "Back"}
              </Button>
              <Button
                type={addDestinationStep === 2 ? "submit" : "button"}
                onClick={addDestinationStep === 1 ? handleNextStep : undefined}
                disabled={
                  addDestinationStep === 2 &&
                  (addDestinationMutation.isPending ||
                    !destinationFormData.streamKey)
                }
              >
                {addDestinationStep === 1 ? (
                  "Next"
                ) : addDestinationMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Destination"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StreamingConfiguration;
