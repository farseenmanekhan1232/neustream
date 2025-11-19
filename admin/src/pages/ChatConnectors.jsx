import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { useAdminTable } from '@/hooks/useAdminTable';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import {
  MessageSquare,
  Youtube,
  Twitch,
  Activity,
  Power,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Chat Connectors Page
 * Manage chat platform integrations (YouTube, Twitch)
 */
export default function ChatConnectors() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const queryClient = useQueryClient();

  // Fetch connectors data
  const { data, isLoading } = useAdminTable('/admin/chat-connectors', {
    page,
    limit,
    search,
    filters: { platform: platformFilter, status: statusFilter },
  });

  // Toggle connector mutation
  const toggleMutation = useMutation({
    mutationFn: async (connectorId) => {
      const response = await adminApi.post(`/admin/chat-connectors/${connectorId}/toggle`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-table', '/admin/chat-connectors']);
      toast.success('Connector status updated');
    },
    onError: () => {
      toast.error('Failed to update connector status');
    },
  });

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return Youtube;
      case 'twitch':
        return Twitch;
      default:
        return MessageSquare;
    }
  };

  const columns = [
    {
      key: 'platform',
      label: 'Platform',
      render: (row) => {
        const Icon = getPlatformIcon(row.platform);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="capitalize">{row.platform}</span>
          </div>
        );
      },
    },
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div>
          <div className="font-medium">{row.user_email}</div>
          <div className="text-sm text-muted-foreground">{row.user_name}</div>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (row) => (
        <div>
          <div className="font-medium">{row.source_name}</div>
          <div className="text-sm text-muted-foreground">ID: {row.source_id}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className="capitalize">{row.connector_type}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => formatDate(row.created_at),
    },
  ];

  const handleToggle = (connector) => {
    toggleMutation.mutate(connector.id);
  };

  const customActions = [
    {
      label: 'Toggle Status',
      onClick: handleToggle,
      icon: <Power className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Connectors"
        description="Manage chat platform integrations for all users"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Connectors"
          value={data?.stats?.total_connectors || 0}
          icon={MessageSquare}
          subtitle="All platforms"
        />
        <StatsCard
          title="Active Connectors"
          value={data?.stats?.active_connectors || 0}
          icon={Activity}
          subtitle="Currently enabled"
        />
        <StatsCard
          title="YouTube"
          value={data?.stats?.youtube_count || 0}
          icon={Youtube}
          subtitle="YouTube chat"
        />
        <StatsCard
          title="Twitch"
          value={data?.stats?.twitch_count || 0}
          icon={Twitch}
          subtitle="Twitch chat"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by user email or source..."
              className="md:w-96"
            />
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Platforms</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        customActions={customActions}
        emptyMessage="No chat connectors found"
        emptyDescription="Chat connectors will appear here when users connect their chat platforms."
      />

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
        />
      )}
    </div>
  );
}
