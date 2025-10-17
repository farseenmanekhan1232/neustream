import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  Users as UsersIcon,
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
  UserPlus,
  X,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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
      console.error('Failed to load users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProvider = filterProvider === 'all' || user.oauth_provider === filterProvider;
    const isSuspended = user.display_name?.startsWith('[SUSPENDED]');
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'suspended' && isSuspended) ||
                         (filterStatus === 'active' && !isSuspended);
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      display_name: user.display_name?.replace('[SUSPENDED] ', '') || user.display_name
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setActionLoading(true);
    try {
      await adminApi.updateUser(editingUser.id, {
        displayName: editingUser.display_name
      });
      showNotification('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      showNotification('Failed to update user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminApi.suspendUser(userId);
      showNotification('User suspended successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      showNotification(error.response?.data?.error || 'Failed to suspend user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspendUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminApi.unsuspendUser(userId);
      showNotification('User unsuspended successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to unsuspend user:', error);
      showNotification('Failed to unsuspend user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetStreamKey = async (userId) => {
    if (!confirm('Are you sure you want to reset this user\'s stream key? This will invalidate their current key.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminApi.resetUserStreamKey(userId);
      showNotification('Stream key reset successfully');
      alert(`New stream key: ${response.streamKey}`);
      loadUsers();
    } catch (error) {
      console.error('Failed to reset stream key:', error);
      showNotification(error.response?.data?.error || 'Failed to reset stream key', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.deleteUser(userId);
      showNotification('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      showNotification(error.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isSuspended = (user) => user.display_name?.startsWith('[SUSPENDED]');

  const UserCard = ({ user }) => {
    const suspended = isSuspended(user);
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user.avatar_url ? (
                  <img
                    className="h-12 w-12 rounded-full"
                    src={user.avatar_url}
                    alt={user.display_name || user.email}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {user.display_name?.[0] || user.email[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  {user.display_name?.replace('[SUSPENDED] ', '') || 'No Display Name'}
                  {suspended && (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={
                user.oauth_provider === 'google' ? 'default' :
                user.oauth_provider === 'twitch' ? 'secondary' :
                'outline'
              }>
                {user.oauth_provider || 'email'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(user.id)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{user.total_sources || 0}</p>
              <p className="text-xs text-gray-500">Sources</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{user.active_streams || 0}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">Joined</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Stream Key: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.stream_key?.substring(0, 12)}...</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewUser(user)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditUser(user)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Quick Actions */}
        <CardFooter className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500">
              Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
            </div>
            <div className="flex space-x-2">
              {!suspended ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuspendUser(user.id)}
                  disabled={actionLoading}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Ban className="h-3 w-3 mr-1" />
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnsuspendUser(user.id)}
                  disabled={actionLoading}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Unsuspend
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResetStreamKey(user.id)}
                disabled={actionLoading}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
              >
                <Key className="h-3 w-3 mr-1" />
                Reset Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
                disabled={actionLoading}
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor all registered users with full CRUD operations.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={loadUsers}
            disabled={actionLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", actionLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.active_streams > 0).length}</p>
              <p className="text-sm text-gray-500">Active Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.oauth_provider).length}</p>
              <p className="text-sm text-gray-500">OAuth Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => isSuspended(u)).length}</p>
              <p className="text-sm text-gray-500">Suspended</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-orange-100 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => {
                  const createdDate = new Date(u.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return createdDate > weekAgo;
                }).length}
              </p>
              <p className="text-sm text-gray-500">New This Week</p>
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
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>{filteredUsers.length} of {users.length} users</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm || filterProvider !== 'all' || filterStatus !== 'all' ? 'No matching users' : 'No users found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterProvider !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by inviting some users to your platform.'}
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
                value={editingUser?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={editingUser?.display_name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oauthProvider">OAuth Provider</Label>
              <Input
                id="oauthProvider"
                value={editingUser?.oauth_provider || 'email'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
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
                <h4 className="text-sm font-medium text-gray-500">Basic Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{selectedUser?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Display Name:</span>
                    <span className="text-sm font-medium">{selectedUser?.display_name || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">OAuth Provider:</span>
                    <Badge variant="outline">{selectedUser?.oauth_provider || 'email'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stream Key:</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{selectedUser?.stream_key}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500">Activity</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Sources:</span>
                    <span className="text-sm font-medium">{selectedUser?.total_sources || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Streams:</span>
                    <span className="text-sm font-medium">{selectedUser?.active_streams || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Since:</span>
                    <span className="text-sm font-medium">
                      {selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Login:</span>
                    <span className="text-sm font-medium">
                      {selectedUser?.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUserDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;