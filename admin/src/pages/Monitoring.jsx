import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import {
  Activity,
  Users,
  Database,
  HardDrive,
  Clock,
  AlertTriangle,
  TrendingUp,
  Server,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';

/**
 * System Monitoring Page
 * Real-time system health and resource usage monitoring
 */
export default function SystemMonitoring() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-monitoring'],
    queryFn: async () => {
      const response = await adminApi.get('/admin/monitoring');
      return response;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: healthData } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const response = await adminApi.get('/admin/monitoring/health');
      return response;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return <LoadingState type="card" />;
  }

  const monitoringData = data?.data || {};
  const health = healthData?.data || {};

  const limitsColumns = [
    {
      key: 'email',
      label: 'User',
      render: (row) => (
        <div>
          <div className="font-medium">{row.email}</div>
          <div className="text-sm text-muted-foreground">{row.plan_name}</div>
        </div>
      ),
    },
    {
      key: 'sources',
      label: 'Sources',
      render: (row) => (
        <div>
          <div className="text-sm">{row.current_sources_count}</div>
          <Progress value={row.sources_usage_percent || 0} className="h-1 mt-1" />
        </div>
      ),
    },
    {
      key: 'destinations',
      label: 'Destinations',
      render: (row) => (
        <div>
          <div className="text-sm">{row.current_destinations_count}</div>
          <Progress value={row.destinations_usage_percent || 0} className="h-1 mt-1" />
        </div>
      ),
    },
    {
      key: 'hours',
      label: 'Hours This Month',
      render: (row) => (
        <div>
          <div className="text-sm font-semibold">
            {row.current_month_streaming_hours.toFixed(1)}h
          </div>
          <Progress value={row.hours_usage_percent || 0} className="h-1 mt-1" />
        </div>
      ),
    },
  ];

  const violationsColumns = [
    {
      key: 'email',
      label: 'User',
      render: (row) => (
        <div>
          <div className="font-medium text-destructive">{row.email}</div>
          <div className="text-sm text-muted-foreground">{row.plan_name}</div>
        </div>
      ),
    },
    {
      key: 'violation',
      label: 'Violation',
      render: (row) => {
        const violations = [];
        if (row.current_sources_count > row.max_sources) {
          violations.push(`Sources: ${row.current_sources_count}/${row.max_sources}`);
        }
        if (row.current_destinations_count > row.max_destinations) {
          violations.push(`Destinations: ${row.current_destinations_count}/${row.max_destinations}`);
        }
        if (row.current_month_streaming_hours > row.max_hours) {
          violations.push(`Hours: ${row.current_month_streaming_hours.toFixed(1)}/${row.max_hours}`);
        }
        return (
          <div className="space-y-1">
            {violations.map((v, i) => (
              <div key={i} className="text-sm text-destructive">{v}</div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Monitoring"
        description="Real-time system health and resource usage"
      />

      {/* System Health Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="System Status"
          value={health.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
          icon={Server}
          subtitle={health.status === 'healthy' ? 'All systems operational' : 'Issues detected'}
        />
        <StatsCard
          title="Active Streams"
          value={monitoringData.activeStreams || 0}
          icon={Activity}
          subtitle="Currently streaming"
        />
        <StatsCard
          title="Memory Usage"
          value={health.memory ? `${health.memory.heapUsed} MB` : '-'}
          icon={HardDrive}
          subtitle={health.memory ? `/ ${health.memory.heapTotal} MB` : 'Checking...'}
        />
        <StatsCard
          title="Uptime"
          value={health.uptime ? `${Math.floor(health.uptime / 3600)}h` : '-'}
          icon={Clock}
          subtitle="Server uptime"
        />
      </div>

      {/* Database Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
          <CardDescription>Current database record counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">
                {formatNumber(monitoringData.dbStats?.total_users)}
              </div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {formatNumber(monitoringData.dbStats?.total_sources)}
              </div>
              <div className="text-sm text-muted-foreground">Sources</div>
            </div>
            <div className="text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">
                {formatNumber(monitoringData.dbStats?.total_destinations)}
              </div>
              <div className="text-sm text-muted-foreground">Destinations</div>
            </div>
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">
                {formatNumber(monitoringData.dbStats?.active_streams)}
              </div>
              <div className="text-sm text-muted-foreground">Active Streams</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">
                {formatNumber(monitoringData.dbStats?.active_subscriptions)}
              </div>
              <div className="text-sm text-muted-foreground">Subscriptions</div>
            </div>
            <div className="text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-pink-500" />
              <div className="text-2xl font-bold">
                {formatNumber(monitoringData.dbStats?.total_chat_connectors)}
              </div>
              <div className="text-sm text-muted-foreground">Chat Connectors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limit Violations */}
      {monitoringData.limitViolations?.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Limit Violations
            </CardTitle>
            <CardDescription>Users exceeding their plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={monitoringData.limitViolations}
              columns={violationsColumns}
              emptyMessage="No limit violations"
            />
          </CardContent>
        </Card>
      )}

      {/* Top Users by Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Usage</CardTitle>
          <CardDescription>Users with highest resource consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={monitoringData.limitsTracking || []}
            columns={limitsColumns}
            emptyMessage="No usage data"
          />
        </CardContent>
      </Card>

      {/* Monthly Streaming Hours */}
      {monitoringData.monthlyHours?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Streaming Hours</CardTitle>
            <CardDescription>Streaming activity over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monitoringData.monthlyHours.map((month) => (
                <div key={month.month_year} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{month.month_year}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{month.total_hours.toFixed(1)} hours</span>
                      <span className="text-muted-foreground">
                        {month.session_count} sessions
                      </span>
                    </div>
                    <Progress
                      value={(month.total_hours / Math.max(...monitoringData.monthlyHours.map(m => m.total_hours))) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
