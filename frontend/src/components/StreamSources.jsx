import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Radio,
  Play,
  Pause,
  Settings,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import { apiService } from "../services/api";

function StreamSources() {
  const { user } = useAuth();
  const { trackUIInteraction } = usePostHog();
  const queryClient = useQueryClient();

  // State for UI interactions
  const [selectedSource, setSelectedSource] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStreamKeys, setShowStreamKeys] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch stream sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["streamSources", user.id],
    queryFn: async () => {
      const response = await apiService.get("/sources");
      return response;
    },
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const sources = sourcesData?.sources || [];

  // Create source mutation
  const createSourceMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiService.post("/sources", data);
      return response;
    },
    onSuccess: (response) => {
      toast.success("Stream source created successfully!");
      setShowCreateDialog(false);
      setFormData({ name: "", description: "" });
      queryClient.invalidateQueries(["streamSources"]);

      trackUIInteraction("stream_source_created", "click", {
        source_id: response.source.id,
        source_name: response.source.name,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to create stream source"
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
      setShowEditDialog(false);
      setSelectedSource(null);
      queryClient.invalidateQueries(["streamSources"]);

      trackUIInteraction("stream_source_updated", "click", {
        source_id: selectedSource?.id,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to update stream source"
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
      setSelectedSource(null);
      queryClient.invalidateQueries(["streamSources"]);

      trackUIInteraction("stream_source_deleted", "click", {
        source_id: selectedSource?.id,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to delete stream source"
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
        source_id: selectedSource?.id,
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to regenerate stream key"
      );
    },
  });

  // Copy to clipboard function
  const copyToClipboard = async (text, field, sourceId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(`${field}-${sourceId}`);
      toast.success(`${field} copied to clipboard!`);

      trackUIInteraction(`copy_${field.toLowerCase()}`, "click", {
        source_id: sourceId,
        field_type: field,
      });

      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Toggle stream key visibility
  const toggleStreamKeyVisibility = (sourceId) => {
    setShowStreamKeys((prev) => ({
      ...prev,
      [sourceId]: !prev[sourceId],
    }));
  };

  // Handle form submission
  const handleCreateSource = () => {
    if (!formData.name.trim()) {
      toast.error("Source name is required");
      return;
    }

    createSourceMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
  };

  const handleUpdateSource = () => {
    if (!formData.name.trim()) {
      toast.error("Source name is required");
      return;
    }

    updateSourceMutation.mutate({
      id: selectedSource.id,
      data: {
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: selectedSource.is_active,
      },
    });
  };

  const handleDeleteSource = () => {
    if (selectedSource.is_active) {
      toast.error("Cannot delete an active stream source");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this stream source? This action cannot be undone."
      )
    ) {
      deleteSourceMutation.mutate(selectedSource.id);
    }
  };

  const handleRegenerateKey = () => {
    if (selectedSource.is_active) {
      toast.error("Cannot regenerate stream key while source is active");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to regenerate the stream key? Your current stream key will stop working immediately."
      )
    ) {
      regenerateKeyMutation.mutate(selectedSource.id);
    }
  };

  // Open edit dialog with source data
  const openEditDialog = (source) => {
    setSelectedSource(source);
    setFormData({
      name: source.name,
      description: source.description || "",
    });
    setShowEditDialog(true);
  };

  if (sourcesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-normal">Stream Sources</div>
          <p className="text-muted-foreground">
            Manage multiple streaming sources, each with their own destinations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Sources Grid */}
      {sources.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stream Sources</h3>
            <p className="text-muted-foreground mb-6">
              Create your first stream source to start multi-platform streaming
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card
              key={source.id}
              className={`relative ${
                source.is_active ? "border-green-200 bg-green-50/50" : ""
              }`}
            >
              {/* Active indicator */}
              {source.is_active && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="bg-green-500">
                    <Play className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-primary" />
                  {source.name}
                </CardTitle>
                <CardDescription>
                  {source.description || "No description"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stream Key */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Stream Key</Label>
                  <div className="flex gap-2">
                    <div className="p-2 bg-muted rounded-md font-mono text-xs border flex-1 overflow-hidden">
                      <span className="truncate block">
                        {showStreamKeys[source.id]
                          ? source.stream_key
                          : "•".repeat(24)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStreamKeyVisibility(source.id)}
                      className="flex-shrink-0"
                    >
                      {showStreamKeys[source.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          source.stream_key,
                          "Stream Key",
                          source.id
                        )
                      }
                      className="flex-shrink-0"
                    >
                      {copiedField === `Stream Key-${source.id}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* RTMP URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">RTMP URL</Label>
                  <div className="flex gap-2">
                    <div className="p-2 bg-muted rounded-md font-mono text-xs border flex-1 overflow-hidden">
                      <span className="truncate block">
                        rtmp://stream.neustream.app/live
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          "rtmp://stream.neustream.app/live",
                          "RTMP URL",
                          source.id
                        )
                      }
                      className="flex-shrink-0"
                    >
                      {copiedField === `RTMP URL-${source.id}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Destinations:</span>
                  <span className="font-medium">
                    {source.destinations_count}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(source)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        source.stream_key,
                        "Stream Key",
                        source.id
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Source Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stream Source</DialogTitle>
            <DialogDescription>
              Create a new streaming source with its own stream key and
              destinations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Gaming Stream, Backup Stream, Chat Only"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what this stream source is used for..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSource}
              disabled={createSourceMutation.isPending}
            >
              {createSourceMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Create Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Source Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stream Source</DialogTitle>
            <DialogDescription>
              Modify your stream source settings and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedSource && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Source Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={selectedSource.is_active}
                  onCheckedChange={(checked) =>
                    setSelectedSource({ ...selectedSource, is_active: checked })
                  }
                  disabled={selectedSource.is_active} // Can't deactivate while streaming
                />
              </div>

              {/* Stream Key Actions */}
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
                      regenerateKeyMutation.isPending ||
                      selectedSource.is_active
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
                      deleteSourceMutation.isPending || selectedSource.is_active
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
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSource}
              disabled={updateSourceMutation.isPending}
            >
              {updateSourceMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StreamSources;
