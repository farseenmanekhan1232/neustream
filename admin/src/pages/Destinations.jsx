"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Search,
  Target,
  Activity,
  Copy,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MinimalStatCard } from "../components/common/MinimalStatCard";
import { ActionMenu } from "../components/common/ActionMenu";
import { FilterPanel } from "../components/common/FilterPanel";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const getPlatformIcon = (platform) => {
  const icons = {
    youtube: "🎥",
    twitch: "🎮",
    facebook: "📘",
    instagram: "📷",
    twitter: "🐦",
   tiktok: "🎵",
    linkedin: "💼",
    custom: "🔗",
  };
  return icons[platform?.toLowerCase()] || "📡";
};

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getDestinations();
      setDestinations(response.data || []);
    } catch (error) {
      console.error("Failed to load destinations:", error);
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast.success(`${type.toUpperCase()} copied to clipboard`);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleViewDestination = (destination) => {
    setSelectedDestination(destination);
    setShowDetailsModal(true);
  };

  const handleEditDestination = (destination) => {
    setEditingDestination({ ...destination });
    setShowEditModal(true);
  };

  const handleUpdateDestination = async () => {
    if (!editingDestination) return;

    setActionLoading(true);
    try {
      await adminApi.updateDestination(editingDestination.id, {
        platform: editingDestination.platform,
        rtmpUrl: editingDestination.rtmp_url,
        streamKey: editingDestination.stream_key,
        isActive: editingDestination.is_active,
      });
      toast.success("Destination updated successfully");
      setShowEditModal(false);
      setEditingDestination(null);
      loadDestinations();
    } catch (error) {
      console.error("Failed to update destination:", error);
      toast.error("Failed to update destination");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDestination = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this destination? This action cannot be undone.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.deleteDestination(id);
      toast.success("Destination deleted successfully");
      loadDestinations();
    } catch (error) {
      console.error("Failed to delete destination:", error);
      toast.error("Failed to delete destination");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.platform
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      destination.source_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      destination.user_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform =
      filterPlatform === "all" || destination.platform === filterPlatform;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && destination.is_active) ||
      (filterStatus === "inactive" && !destination.is_active);

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getActiveFilters = () => {
    const filters = [];
    if (filterPlatform !== "all") {
      filters.push({
        key: "platform",
        label: "Platform",
        value: filterPlatform,
      });
    }
    if (filterStatus !== "all") {
      filters.push({
        key: "status",
        label: "Status",
        value: filterStatus,
      });
    }
    return filters;
  };

  const clearFilter = (key) => {
    if (key === "platform") setFilterPlatform("all");
    if (key === "status") setFilterStatus("all");
  };

  const clearAllFilters = () => {
    setFilterPlatform("all");
    setFilterStatus("all");
  };

  const DestinationRow = ({ destination }) => {
    const actions = [
      {
        label: "View Details",
        icon: Eye,
        onClick: () => handleViewDestination(destination),
      },
      {
        label: "Edit Destination",
        icon: Edit,
        onClick: () => handleEditDestination(destination),
      },
      {
        separator: true,
      },
      {
        label: "Delete Destination",
        icon: Trash2,
        onClick: () => handleDeleteDestination(destination.id),
        variant: "destructive",
      },
    ];

    return (
      <TableRow className="hover:bg-muted/50 transition-smooth">
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg text-2xl">
              {getPlatformIcon(destination.platform)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize text-foreground">
                  {destination.platform}
                </span>
                {!destination.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {destination.source_name || "Unknown Source"}
              </p>
              <p className="text-xs text-muted-foreground">
                {destination.user_display_name || destination.user_email}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={destination.is_active ? "default" : "secondary"}
            className={cn(
              destination.is_active &&
                "bg-success/10 text-success border-success/20",
            )}
          >
            {destination.is_active ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <span className="text-sm text-muted-foreground">
            {new Date(destination.created_at).toLocaleDateString()}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <ActionMenu actions={actions} />
        </TableCell>
      </TableRow>
    );
  };

  const activeDestinations = destinations.filter((d) => d.is_active).length;
  const platformCounts = destinations.reduce((acc, d) => {
    acc[d.platform] = (acc[d.platform] || 0) + 1;
    return acc;
  }, {});
  const topPlatform =
    Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "None";

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-minimal">
              <CardContent className="p-6">
                <div className="h-4 w-1/2 bg-muted rounded mb-4 animate-pulse" />
                <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Streaming Destinations
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage all streaming destinations across users
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MinimalStatCard
          title="Total Destinations"
          value={destinations.length}
          icon={Target}
          trend="Across all users"
          trendType="neutral"
        />
        <MinimalStatCard
          title="Active Destinations"
          value={activeDestinations}
          icon={Activity}
          trend={`${Math.round((activeDestinations / Math.max(destinations.length, 1)) * 100)}% of total`}
          trendType="positive"
        />
        <MinimalStatCard
          title="Top Platform"
          value={topPlatform}
          icon={Target}
          trend={`${platformCounts[topPlatform] || 0} destinations`}
          trendType="neutral"
        />
      </div>

      {/* Search and Filters */}
      <Card className="card-minimal">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search destinations by platform, source, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <FilterPanel
              activeFilters={getActiveFilters()}
              onClearFilter={clearFilter}
              onClearAll={clearAllFilters}
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Platform
                  </Label>
                  <Select
                    value={filterPlatform}
                    onValueChange={setFilterPlatform}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitch">Twitch</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterPanel>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredDestinations.length} of {destinations.length}{" "}
            destinations
          </div>
        </CardContent>
      </Card>

      {/* Destinations Table */}
      {filteredDestinations.length > 0 ? (
        <Card className="card-minimal">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Created</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDestinations.map((destination) => (
                  <DestinationRow
                    key={destination.id}
                    destination={destination}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-minimal">
          <CardContent className="p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {searchTerm ||
              filterPlatform !== "all" ||
              filterStatus !== "all"
                ? "No matching destinations"
                : "No destinations found"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ||
              filterPlatform !== "all" ||
              filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Destinations will appear here as users configure their streams."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Destination Details</DialogTitle>
          </DialogHeader>
          {selectedDestination && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Platform
                  </Label>
                  <p className="text-sm font-medium mt-1 capitalize">
                    {selectedDestination.platform}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedDestination.is_active ? "default" : "secondary"
                      }
                    >
                      {selectedDestination.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  RTMP URL
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono">
                    {selectedDestination.rtmp_url}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        selectedDestination.rtmp_url,
                        "RTMP URL",
                      )
                    }
                  >
                    {copiedText === "RTMP URL" ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Stream Key
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono">
                    {selectedDestination.stream_key}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        selectedDestination.stream_key,
                        "Stream Key",
                      )
                    }
                  >
                    {copiedText === "Stream Key" ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Destination Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
          </DialogHeader>
          {editingDestination && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Platform</Label>
                <Input
                  value={editingDestination.platform}
                  onChange={(e) =>
                    setEditingDestination({
                      ...editingDestination,
                      platform: e.target.value,
                    })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>RTMP URL</Label>
                <Input
                  value={editingDestination.rtmp_url}
                  onChange={(e) =>
                    setEditingDestination({
                      ...editingDestination,
                      rtmp_url: e.target.value,
                    })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Stream Key</Label>
                <Input
                  value={editingDestination.stream_key}
                  onChange={(e) =>
                    setEditingDestination({
                      ...editingDestination,
                      stream_key: e.target.value,
                    })
                  }
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={editingDestination.is_active}
                  onCheckedChange={(checked) =>
                    setEditingDestination({
                      ...editingDestination,
                      is_active: checked,
                    })
                  }
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default DestinationsPage;
