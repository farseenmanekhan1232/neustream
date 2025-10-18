"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Target,
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  Copy,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showDestinationDetails, setShowDestinationDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getDestinations();
      setDestinations(response.destinations || []);
    } catch (error) {
      console.error("Failed to load destinations:", error);
      showNotification("Failed to load destinations", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.rtmp_url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform =
      filterPlatform === "all" || dest.platform === filterPlatform;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && dest.is_active) ||
      (filterStatus === "inactive" && !dest.is_active);
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleViewDestination = async (destination) => {
    try {
      const response = await adminApi.getDestination(destination.id);
      setSelectedDestination(response.destination);
      setShowDestinationDetails(true);
    } catch (error) {
      console.error("Failed to load destination details:", error);
      showNotification("Failed to load destination details", "error");
    }
  };

  const handleEditDestination = (destination) => {
    setEditingDestination(destination);
    setShowEditModal(true);
  };

  const handleUpdateDestination = async () => {
    if (!editingDestination) return;

    setActionLoading(true);
    try {
      await adminApi.updateDestination(editingDestination.id, {
        platform: editingDestination.platform,
        rtmp_url: editingDestination.rtmp_url,
        stream_key: editingDestination.stream_key,
        is_active: editingDestination.is_active,
      });
      showNotification("Destination updated successfully");
      setShowEditModal(false);
      setEditingDestination(null);
      loadDestinations();
    } catch (error) {
      console.error("Failed to update destination:", error);
      showNotification(
        error.response?.data?.error || "Failed to update destination",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDestination = async (destinationId) => {
    if (
      !confirm(
        "Are you sure you want to delete this destination? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.deleteDestination(destinationId);
      showNotification("Destination deleted successfully");
      loadDestinations();
    } catch (error) {
      console.error("Failed to delete destination:", error);
      showNotification(
        error.response?.data?.error || "Failed to delete destination",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return "🎥";
      case "twitch":
        return "📺";
      case "facebook":
        return "📘";
      case "instagram":
        return "📷";
      case "linkedin":
        return "💼";
      case "twitter":
        return "🐦";
      default:
        return "📡";
    }
  };

  const DestinationTableRow = ({ destination }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-muted rounded-full">
              <span className="text-sm">
                {getPlatformIcon(destination.platform)}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">
                {destination.platform}
              </span>
              {!destination.is_active && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Source: {destination.source_name || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              Owner: {destination.user_display_name || destination.user_email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate max-w-[200px]">
              {destination.rtmp_url}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleCopyToClipboard(destination.rtmp_url, "rtmp")
              }
              className="h-6 w-6 p-0"
            >
              {copiedText === "rtmp" ? (
                <CheckCircle className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate max-w-[200px]">
              {destination.stream_key}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleCopyToClipboard(destination.stream_key, "key")
              }
              className="h-6 w-6 p-0"
            >
              {copiedText === "key" ? (
                <CheckCircle className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-center">
          <Badge
            variant={destination.is_active ? "default" : "secondary"}
            className={cn(
              destination.is_active ? "bg-success/10 text-success" : ""
            )}
          >
            {destination.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-center">
          <p className="text-sm">
            {new Date(destination.created_at).toLocaleDateString()}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-xs text-center font-mono">{destination.id}</div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDestination(destination)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditDestination(destination)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteDestination(destination.id)}
            disabled={actionLoading}
            className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Destinations</h1>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>RTMP Configuration</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Created</TableHead>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-32"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-muted rounded w-16 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-20 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="h-8 w-8 bg-muted rounded"
                          ></div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
          <h1 className="text-2xl font-bold text-foreground">
            Stream Destinations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor all streaming destinations across platforms.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadDestinations}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {destinations.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Destinations
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-success/10 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {destinations.filter((d) => d.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-destructive/10 rounded-full mr-4">
              <span className="text-xl">🎥</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {destinations.filter((d) => d.platform === "youtube").length}
              </p>
              <p className="text-sm text-muted-foreground">YouTube</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <span className="text-xl">📺</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {destinations.filter((d) => d.platform === "twitch").length}
              </p>
              <p className="text-sm text-muted-foreground">Twitch</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <span className="text-xl">📘</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {destinations.filter((d) => d.platform === "facebook").length}
              </p>
              <p className="text-sm text-muted-foreground">Facebook</p>
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
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                {filteredDestinations.length} of {destinations.length}{" "}
                destinations
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destinations Table */}
      {filteredDestinations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>RTMP Configuration</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Created</TableHead>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDestinations.map((destination) => (
                  <DestinationTableRow
                    key={destination.id}
                    destination={destination}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">
              {searchTerm || filterPlatform !== "all" || filterStatus !== "all"
                ? "No matching destinations"
                : "No destinations found"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || filterPlatform !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by adding some streaming destinations."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Destination Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={editingDestination?.platform}
                onValueChange={(value) =>
                  setEditingDestination({
                    ...editingDestination,
                    platform: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rtmp_url">RTMP URL</Label>
              <Input
                id="rtmp_url"
                type="text"
                className="font-mono"
                value={editingDestination?.rtmp_url || ""}
                onChange={(e) =>
                  setEditingDestination({
                    ...editingDestination,
                    rtmp_url: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="stream_key">Stream Key</Label>
              <Input
                id="stream_key"
                type="text"
                className="font-mono"
                value={editingDestination?.stream_key || ""}
                onChange={(e) =>
                  setEditingDestination({
                    ...editingDestination,
                    stream_key: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                type="text"
                value={editingDestination?.source_name || "Unknown"}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                type="text"
                value={
                  editingDestination?.user_display_name ||
                  editingDestination?.user_email
                }
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingDestination?.is_active || false}
                onChange={(e) =>
                  setEditingDestination({
                    ...editingDestination,
                    is_active: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_active" className="text-sm">
                Active (this destination will receive streams)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDestination} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Destination Details Modal */}
      <Dialog
        open={showDestinationDetails}
        onOpenChange={setShowDestinationDetails}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Destination Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Platform:</span>
                    <Badge variant="outline">
                      {selectedDestination?.platform}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge
                      variant={
                        selectedDestination?.is_active ? "default" : "secondary"
                      }
                    >
                      {selectedDestination?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Source:</span>
                    <span className="text-sm">
                      {selectedDestination?.source_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Owner:</span>
                    <span className="text-sm">
                      {selectedDestination?.user_display_name ||
                        selectedDestination?.user_email}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">RTMP URL:</span>
                    <div className="mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded break-all block">
                        {selectedDestination?.rtmp_url}
                      </code>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Stream Key:</span>
                    <div className="mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded break-all block">
                        {selectedDestination?.stream_key}
                      </code>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm">
                      {new Date(
                        selectedDestination?.created_at
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Destination ID:</span>
                    <div className="mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {selectedDestination?.id}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full RTMP Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border font-mono break-all">
                    {selectedDestination?.rtmp_url}/
                    {selectedDestination?.stream_key}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        `${selectedDestination?.rtmp_url}/${selectedDestination?.stream_key}`,
                        "full"
                      )
                    }
                  >
                    {copiedText === "full" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDestinationDetails(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DestinationsPage;
