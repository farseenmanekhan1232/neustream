"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Radio,
  Search,
  Filter,
  Target,
  Calendar,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Key,
  Wifi,
  WifiOff,
  X,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SourcesPage = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState(null);
  const [showSourceDetails, setShowSourceDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSources();
      setSources(response.sources || []);
    } catch (error) {
      console.error("Failed to load sources:", error);
      showNotification("Failed to load sources", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredSources = sources.filter((source) => {
    const matchesSearch =
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.stream_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && source.is_active) ||
      (filterStatus === "inactive" && !source.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleViewSource = async (source) => {
    try {
      const response = await adminApi.getSource(source.id);
      setSelectedSource(response.source);
      setShowSourceDetails(true);
    } catch (error) {
      console.error("Failed to load source details:", error);
      showNotification("Failed to load source details", "error");
    }
  };

  const handleEditSource = (source) => {
    setEditingSource(source);
    setShowEditModal(true);
  };

  const handleUpdateSource = async () => {
    if (!editingSource) return;

    setActionLoading(true);
    try {
      await adminApi.updateSource(editingSource.id, {
        name: editingSource.name,
        description: editingSource.description,
        is_active: editingSource.is_active,
      });
      showNotification("Source updated successfully");
      setShowEditModal(false);
      setEditingSource(null);
      loadSources();
    } catch (error) {
      console.error("Failed to update source:", error);
      showNotification(
        error.response?.data?.error || "Failed to update source",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (
      !confirm(
        "Are you sure you want to delete this source? This will also delete all associated destinations and cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.deleteSource(sourceId);
      showNotification("Source deleted successfully");
      loadSources();
    } catch (error) {
      console.error("Failed to delete source:", error);
      showNotification(
        error.response?.data?.error || "Failed to delete source",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateKey = async (sourceId) => {
    if (
      !confirm(
        "Are you sure you want to regenerate this stream key? This will invalidate the current key."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminApi.regenerateSourceKey(sourceId);
      showNotification("Stream key regenerated successfully");
      alert(`New stream key: ${response.source.stream_key}`);
      loadSources();
    } catch (error) {
      console.error("Failed to regenerate stream key:", error);
      showNotification(
        error.response?.data?.error || "Failed to regenerate stream key",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const SourceCard = ({ source }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div
                className={`p-3 rounded-full ${
                  source.is_active ? "bg-success/10" : "bg-muted"
                }`}
              >
                {source.is_active ? (
                  <Wifi className="h-6 w-6 text-success" />
                ) : (
                  <WifiOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                {source.name}
                {!source.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {source.display_name || source.email}
              </p>
              {source.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {source.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                source.oauth_provider === "google"
                  ? "default"
                  : source.oauth_provider === "twitch"
                  ? "secondary"
                  : "outline"
              }
            >
              {source.oauth_provider || "email"}
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {source.destinations_count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Destinations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {source.is_active ? "Live" : "Offline"}
            </p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {new Date(source.created_at).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">Created</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Stream Key:
            <span
              className="font-mono bg-muted px-2 py-1 rounded ml-2 cursor-pointer hover:bg-muted/80"
              onClick={() => handleCopyToClipboard(source.stream_key, "stream")}
            >
              {source.stream_key?.substring(0, 12)}...
            </span>
            {copiedKey === "stream" && (
              <CheckCircle className="inline h-3 w-3 text-success ml-1" />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewSource(source)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditSource(source)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Quick Actions */}
      <CardFooter className="border-t bg-muted/50 px-6 py-3">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Last used:{" "}
            {source.last_used_at
              ? new Date(source.last_used_at).toLocaleDateString()
              : "Never"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerateKey(source.id)}
              disabled={actionLoading}
              className="text-warning border-warning/30 hover:bg-warning/10"
            >
              <Key className="h-3 w-3 mr-1" />
              Regenerate Key
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteSource(source.id)}
              disabled={actionLoading}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Stream Sources</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
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
      {/* Notification */}
      {notification && (
        <Alert
          variant={notification.type === "error" ? "destructive" : "default"}
        >
          <AlertDescription className="flex items-center justify-between">
            <span>{notification.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotification(null)}
              className="ml-auto -mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stream Sources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor all stream sources with full CRUD operations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadSources}
            disabled={actionLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", actionLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <Radio className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {sources.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Sources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-success/10 rounded-full mr-4">
              <Wifi className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {sources.filter((s) => s.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {sources.reduce(
                  (acc, s) => acc + (s.destinations_count || 0),
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Destinations
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-warning/10 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {
                  sources.filter((s) => {
                    const createdDate = new Date(s.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate > weekAgo;
                  }).length
                }
              </p>
              <p className="text-sm text-muted-foreground">New This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                {filteredSources.length} of {sources.length} sources
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources Grid */}
      {filteredSources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">
              {searchTerm || filterStatus !== "all"
                ? "No matching sources"
                : "No sources found"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by creating some stream sources."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Source Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Stream Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sourceName">Source Name</Label>
              <Input
                id="sourceName"
                value={editingSource?.name || ""}
                onChange={(e) =>
                  setEditingSource({ ...editingSource, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={3}
                value={editingSource?.description || ""}
                onChange={(e) =>
                  setEditingSource({
                    ...editingSource,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={editingSource?.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="streamKey">Stream Key</Label>
              <div className="flex">
                <Input
                  id="streamKey"
                  value={editingSource?.stream_key}
                  disabled
                  className="font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopyToClipboard(editingSource.stream_key, "edit")
                  }
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingSource?.is_active}
                onChange={(e) =>
                  setEditingSource({
                    ...editingSource,
                    is_active: e.target.checked,
                  })
                }
                className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
              />
              <Label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active (user can stream with this source)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSource} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Source Details Modal */}
      <Dialog open={showSourceDetails} onOpenChange={setShowSourceDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Source Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Basic Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">
                      {selectedSource?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Description:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedSource?.description || "No description"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Owner:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedSource?.display_name || selectedSource?.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <Badge
                      variant={
                        selectedSource?.is_active ? "default" : "secondary"
                      }
                    >
                      {selectedSource?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Technical Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Stream Key:
                    </span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {selectedSource?.stream_key}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Created:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedSource?.created_at
                        ? new Date(selectedSource.created_at).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Used:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedSource?.last_used_at
                        ? new Date(selectedSource.last_used_at).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Destinations:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedSource?.destinations_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedSource?.stats && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Streaming Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {selectedSource.stats.totalStreams || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Streams
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {Math.round(
                          (selectedSource.stats.avgDuration || 0) / 60
                        )}
                        m
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Average Duration
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {selectedSource?.active_stream && (
              <Alert>
                <Wifi className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-success">
                        Currently Streaming
                      </div>
                      <div className="text-sm text-success/80">
                        Started:{" "}
                        {new Date(
                          selectedSource.active_stream.started_at
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSourceDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SourcesPage;
