"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  UsersIcon,
  Search,
  Mail,
  Activity,
  Ban,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Key,
  Settings as SettingsIcon,
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

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.display_name &&
        user.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProvider =
      filterProvider === "all" || user.oauth_provider === filterProvider;
    const isSuspended = user.display_name?.startsWith("[SUSPENDED]");
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "suspended" && isSuspended) ||
      (filterStatus === "active" && !isSuspended);
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      display_name:
        user.display_name?.replace("[SUSPENDED] ", "") || user.display_name,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setActionLoading(true);
    try {
      await adminApi.updateUser(editingUser.id, {
        displayName: editingUser.display_name,
      });
      toast.success("User updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminApi.suspendUser(userId);
      toast.success("User suspended successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to suspend user:", error);
      toast.error(error.response?.data?.error || "Failed to suspend user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminApi.unsuspendUser(userId);
      toast.success("User unsuspended successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to unsuspend user:", error);
      toast.error("Failed to unsuspend user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetStreamKey = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to reset this user's stream key? This will invalidate their current key.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminApi.resetUserStreamKey(userId);
      toast.success("Stream key reset successfully");
      alert(`New stream key: ${response.streamKey}`);
      loadUsers();
    } catch (error) {
      console.error("Failed to reset stream key:", error);
      toast.error(error.response?.data?.error || "Failed to reset stream key");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(error.response?.data?.error || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const isSuspended = (user) => user.display_name?.startsWith("[SUSPENDED]");

  const getActiveFilters = () => {
    const filters = [];
    if (filterProvider !== "all") {
      filters.push({
        key: "provider",
        label: "Provider",
        value: filterProvider,
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
    if (key === "provider") setFilterProvider("all");
    if (key === "status") setFilterStatus("all");
  };

  const clearAllFilters = () => {
    setFilterProvider("all");
    setFilterStatus("all");
  };

  const UserTableRow = ({ user }) => {
    const suspended = isSuspended(user);
    
    const actions = [
      {
        label: "View Details",
        icon: Eye,
        onClick: () => {
          setSelectedUser(user);
          setShowUserDetails(true);
        },
      },
      {
        label: "Edit User",
        icon: Edit,
        onClick: () => handleEditUser(user),
      },
      {
        separator: true,
      },
      suspended
        ? {
            label: "Unsuspend",
            icon: CheckCircle,
            onClick: () => handleUnsuspendUser(user.id),
            variant: "success",
          }
        : {
            label: "Suspend",
            icon: Ban,
            onClick: () => handleSuspendUser(user.id),
            variant: "destructive",
          },
      {
        label: "Reset Stream Key",
        icon: Key,
        onClick: () => handleResetStreamKey(user.id),
      },
      {
        separator: true,
      },
      {
        label: "Delete User",
        icon: Trash2,
        onClick: () => handleDeleteUser(user.id),
        variant: "destructive",
      },
    ];

    return (
      <TableRow className="hover:bg-muted/50 transition-smooth">
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.display_name || user.email}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.display_name?.[0] || user.email[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {user.display_name?.replace("[SUSPENDED] ", "") ||
                    "No Display Name"}
                </span>
                {suspended && (
                  <Badge variant="destructive" className="text-xs">
                    Suspended
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <Badge
            variant={
              user.oauth_provider === "google"
                ? "default"
                : user.oauth_provider === "twitch"
                ? "secondary"
                : "outline"
            }
          >
            {user.oauth_provider || "email"}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <span className="font-medium">{user.total_sources || 0}</span>
        </TableCell>
        <TableCell className="text-center">
          <span className="font-medium text-success">
            {user.active_streams || 0}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <span className="text-sm text-muted-foreground">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <ActionMenu actions={actions} />
        </TableCell>
      </TableRow>
    );
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            User Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage and monitor all registered users
          </p>
        </div>
        <Button variant="outline" onClick={loadUsers} disabled={actionLoading}>
          <RefreshCw
            className={cn("h-4 w-4 mr-2", actionLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Key Stats - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MinimalStatCard
          title="Total Users"
          value={users.length}
          icon={UsersIcon}
          trend="+12% from last month"
          trendType="positive"
        />
        <MinimalStatCard
          title="Active Today"
          value={users.filter((u) => u.active_streams > 0).length}
          icon={Activity}
          trend="Currently streaming"
          trendType="positive"
        />
        <MinimalStatCard
          title="Suspended"
          value={users.filter((u) => isSuspended(u)).length}
          icon={Ban}
          trend={`${Math.round((users.filter((u) => isSuspended(u)).length / Math.max(users.length, 1)) * 100)}% of total`}
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
                  placeholder="Search users by name or email..."
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
                    Provider
                  </Label>
                  <Select value={filterProvider} onValueChange={setFilterProvider}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="twitch">Twitch</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
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
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterPanel>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <Card className="card-minimal">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-center">Provider</TableHead>
                  <TableHead className="text-center">Sources</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Joined</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <UserTableRow key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-minimal">
          <CardContent className="p-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {searchTerm || filterProvider !== "all" || filterStatus !== "all"
                ? "No matching users"
                : "No users found"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || filterProvider !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by inviting some users to your platform."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingUser?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={editingUser?.display_name || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    display_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oauthProvider">OAuth Provider</Label>
              <Input
                id="oauthProvider"
                value={editingUser?.oauth_provider || "email"}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary">
                    {selectedUser.display_name?.[0] ||
                      selectedUser.email[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.display_name || "No Display Name"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Total Sources
                  </Label>
                  <p className="text-2xl font-semibold mt-1">
                    {selectedUser.total_sources || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Active Streams
                  </Label>
                  <p className="text-2xl font-semibold mt-1 text-success">
                    {selectedUser.active_streams || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Stream Key
                  </Label>
                  <p className="text-xs font-mono mt-1 bg-muted p-2 rounded">
                    {selectedUser.stream_key}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Last Login
                  </Label>
                  <p className="text-sm mt-1">
                    {selectedUser.last_login
                      ? new Date(selectedUser.last_login).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
