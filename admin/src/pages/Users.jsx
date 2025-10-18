"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  UsersIcon,
  Search,
  Filter,
  Mail,
  Calendar,
  Activity,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  RefreshCw,
  Key,
  X,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

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
      showNotification("User updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      showNotification("Failed to update user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminApi.suspendUser(userId);
      showNotification("User suspended successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to suspend user:", error);
      showNotification(
        error.response?.data?.error || "Failed to suspend user",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminApi.unsuspendUser(userId);
      showNotification("User unsuspended successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to unsuspend user:", error);
      showNotification("Failed to unsuspend user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetStreamKey = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to reset this user's stream key? This will invalidate their current key."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminApi.resetUserStreamKey(userId);
      showNotification("Stream key reset successfully");
      alert(`New stream key: ${response.streamKey}`);
      loadUsers();
    } catch (error) {
      console.error("Failed to reset stream key:", error);
      showNotification(
        error.response?.data?.error || "Failed to reset stream key",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.deleteUser(userId);
      showNotification("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      showNotification(
        error.response?.data?.error || "Failed to delete user",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const isSuspended = (user) => user.display_name?.startsWith("[SUSPENDED]");

  const UserTableRow = ({ user }) => {
    const suspended = isSuspended(user);
    return (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.display_name || user.email}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {user.display_name?.[0] || user.email[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {user.display_name?.replace("[SUSPENDED] ", "") || "No Display Name"}
                </span>
                {suspended && <Badge variant="destructive">Suspended</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
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
        <TableCell>
          <div className="text-center">
            <p className="font-medium">{user.total_sources || 0}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-center">
            <p className="font-medium text-success">{user.active_streams || 0}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-center">
            <p className="font-medium">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-center">
            {user.stream_key?.substring(0, 12)}...
          </div>
        </TableCell>
        <TableCell>
          <div className="text-xs text-center">
            {user.last_login
              ? new Date(user.last_login).toLocaleDateString()
              : "Never"}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewUser(user)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditUser(user)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {!suspended ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuspendUser(user.id)}
                disabled={actionLoading}
                className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Ban className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnsuspendUser(user.id)}
                disabled={actionLoading}
                className="h-8 w-8 p-0 text-success border-success/30 hover:bg-success/10"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResetStreamKey(user.id)}
              disabled={actionLoading}
              className="h-8 w-8 p-0 text-warning border-warning/30 hover:bg-warning/10"
            >
              <Key className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteUser(user.id)}
              disabled={actionLoading}
              className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-center">Sources</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Joined</TableHead>
                  <TableHead className="text-center">Stream Key</TableHead>
                  <TableHead className="text-center">Last Login</TableHead>
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
                          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-48"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-8 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-8 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-20 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="h-8 w-8 bg-muted rounded"></div>
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
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor all registered users with full CRUD operations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadUsers}
            disabled={actionLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", actionLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-success/10 rounded-full mr-4">
              <Activity className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.active_streams > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.oauth_provider).length}
              </p>
              <p className="text-sm text-muted-foreground">OAuth Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-destructive/10 rounded-full mr-4">
              <Ban className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => isSuspended(u)).length}
              </p>
              <p className="text-sm text-muted-foreground">Suspended</p>
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
                  users.filter((u) => {
                    const createdDate = new Date(u.created_at);
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

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterProvider} onValueChange={setFilterProvider}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-center">Sources</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Joined</TableHead>
                  <TableHead className="text-center">Stream Key</TableHead>
                  <TableHead className="text-center">Last Login</TableHead>
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
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">
              {searchTerm || filterProvider !== "all" || filterStatus !== "all"
                ? "No matching users"
                : "No users found"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
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
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Basic Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Display Name:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser?.display_name || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      OAuth Provider:
                    </span>
                    <Badge variant="outline">
                      {selectedUser?.oauth_provider || "email"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Stream Key:
                    </span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {selectedUser?.stream_key}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Activity
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Sources:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser?.total_sources || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Active Streams:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser?.active_streams || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Member Since:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser?.created_at
                        ? new Date(selectedUser.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Login:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser?.last_login
                        ? new Date(selectedUser.last_login).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUserDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
