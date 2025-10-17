import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  Target,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  RefreshCw,
  X,
  MoreVertical,
  CheckCircle,
  Copy,
  Eye,
  Radio,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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
      console.error('Failed to load destinations:', error);
      showNotification('Failed to load destinations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.rtmp_url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || dest.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && dest.is_active) ||
                         (filterStatus === 'inactive' && !dest.is_active);
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleViewDestination = async (destination) => {
    try {
      const response = await adminApi.getDestination(destination.id);
      setSelectedDestination(response.destination);
      setShowDestinationDetails(true);
    } catch (error) {
      console.error('Failed to load destination details:', error);
      showNotification('Failed to load destination details', 'error');
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
        is_active: editingDestination.is_active
      });
      showNotification('Destination updated successfully');
      setShowEditModal(false);
      setEditingDestination(null);
      loadDestinations();
    } catch (error) {
      console.error('Failed to update destination:', error);
      showNotification(error.response?.data?.error || 'Failed to update destination', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDestination = async (destinationId) => {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.deleteDestination(destinationId);
      showNotification('Destination deleted successfully');
      loadDestinations();
    } catch (error) {
      console.error('Failed to delete destination:', error);
      showNotification(error.response?.data?.error || 'Failed to delete destination', 'error');
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
      console.error('Failed to copy:', error);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return '🎥';
      case 'twitch':
        return '📺';
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'linkedin':
        return '💼';
      case 'twitter':
        return '🐦';
      default:
        return '📡';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'bg-red-100 text-red-800';
      case 'twitch':
        return 'bg-purple-100 text-purple-800';
      case 'facebook':
        return 'bg-blue-100 text-blue-800';
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'linkedin':
        return 'bg-blue-100 text-blue-800';
      case 'twitter':
        return 'bg-sky-100 text-sky-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const DestinationCard = ({ destination }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="p-3 bg-muted rounded-full">
                <span className="text-2xl">{getPlatformIcon(destination.platform)}</span>
              </div>
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {destination.platform.charAt(0).toUpperCase() + destination.platform.slice(1)}
                {!destination.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Source: {destination.source_name || 'Unknown'}
              </CardDescription>
              <p className="text-xs text-muted-foreground">
                Owner: {destination.user_display_name || destination.user_email}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn(getPlatformColor(destination.platform))}>
            {destination.platform}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider">RTMP URL</Label>
            <div className="mt-1 flex items-center">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate">
                {destination.rtmp_url}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(destination.rtmp_url, 'rtmp')}
                className="ml-2 h-8 w-8 p-0"
              >
                {copiedText === 'rtmp' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider">Stream Key</Label>
            <div className="mt-1 flex items-center">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate">
                {destination.stream_key}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(destination.stream_key, 'key')}
                className="ml-2 h-8 w-8 p-0"
              >
                {copiedText === 'key' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{destination.is_active ? 'Active' : 'Inactive'}</p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {new Date(destination.created_at).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">Created</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <div className="text-xs text-muted-foreground">
          ID: <span className="font-mono">{destination.id}</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDestination(destination)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditDestination(destination)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardFooter>

      {/* Quick Actions */}
      <div className="border-t bg-muted/50 px-6 py-3 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Platform: {destination.platform}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteDestination(destination.id)}
            disabled={actionLoading}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Stream Destinations</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor all streaming destinations across platforms.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={loadDestinations}
            disabled={actionLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", actionLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{destinations.length}</p>
              <p className="text-sm text-gray-500">Total Destinations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{destinations.filter(d => d.is_active).length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <span className="text-xl">🎥</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{destinations.filter(d => d.platform === 'youtube').length}</p>
              <p className="text-sm text-gray-500">YouTube</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <span className="text-xl">📺</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{destinations.filter(d => d.platform === 'twitch').length}</p>
              <p className="text-sm text-gray-500">Twitch</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-orange-100 rounded-full mr-4">
              <span className="text-xl">📘</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{destinations.filter(d => d.platform === 'facebook').length}</p>
              <p className="text-sm text-gray-500">Facebook</p>
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
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>{filteredDestinations.length} of {destinations.length} destinations</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destinations Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm || filterPlatform !== 'all' || filterStatus !== 'all' ? 'No matching destinations' : 'No destinations found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterPlatform !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding some streaming destinations.'}
            </p>
          </div>
        </div>
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
              <Select value={editingDestination?.platform} onValueChange={(value) => setEditingDestination({ ...editingDestination, platform: value })}>
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
                value={editingDestination?.rtmp_url || ''}
                onChange={(e) => setEditingDestination({ ...editingDestination, rtmp_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="stream_key">Stream Key</Label>
              <Input
                id="stream_key"
                type="text"
                className="font-mono"
                value={editingDestination?.stream_key || ''}
                onChange={(e) => setEditingDestination({ ...editingDestination, stream_key: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                type="text"
                value={editingDestination?.source_name || 'Unknown'}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                type="text"
                value={editingDestination?.user_display_name || editingDestination?.user_email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingDestination?.is_active || false}
                onChange={(e) => setEditingDestination({ ...editingDestination, is_active: e.target.checked })}
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
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Destination Details Modal */}
      <Dialog open={showDestinationDetails} onOpenChange={setShowDestinationDetails}>
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
                    <Badge variant="outline">{selectedDestination?.platform}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={selectedDestination?.is_active ? 'default' : 'secondary'}>
                      {selectedDestination?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Source:</span>
                    <span className="text-sm">{selectedDestination?.source_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Owner:</span>
                    <span className="text-sm">{selectedDestination?.user_display_name || selectedDestination?.user_email}</span>
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
                    <span className="text-sm">{new Date(selectedDestination?.created_at).toLocaleString()}</span>
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
                    {selectedDestination?.rtmp_url}/{selectedDestination?.stream_key}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(`${selectedDestination?.rtmp_url}/${selectedDestination?.stream_key}`, 'full')}
                  >
                    {copiedText === 'full' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDestinationDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DestinationsPage;