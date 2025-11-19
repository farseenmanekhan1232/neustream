import React, { useState } from 'react';
import { useAdminTable } from '@/hooks/useAdminTable';
import DataTable from '@/components/common/DataTable';
import PageHeader, { CreateButton } from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';

/**
 * Payments Admin Page
 * Manage payment orders and transactions
 */
export default function Payments() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch payments data
  const { data, isLoading, error } = useAdminTable('/admin/payments', {
    page,
    limit,
    search,
    filters: { status: statusFilter },
  });

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (row) => (
        <div className="font-mono text-sm">{row.order_id || row.id}</div>
      ),
    },
    {
      key: 'user_email',
      label: 'User',
      render: (row) => (
        <div>
          <div className="font-medium">{row.user_email}</div>
          <div className="text-sm text-muted-foreground">{row.user_id}</div>
        </div>
      ),
    },
    {
      key: 'plan_name',
      label: 'Plan',
      render: (row) => (
        <div>
          <div className="font-medium">{row.plan_name}</div>
          <div className="text-sm text-muted-foreground">{row.billing_cycle}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <div className="font-semibold">
          {formatCurrency(row.amount, row.currency || 'INR')}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => formatDate(row.created_at),
    },
  ];

  const handleViewDetails = (payment) => {
    console.log('View payment:', payment);
    // TODO: Open modal with payment details
  };

  const handleRefund = (payment) => {
    console.log('Refund payment:', payment);
    // TODO: Implement refund logic
  };

  const customActions = [
    {
      label: 'Refund',
      onClick: handleRefund,
      icon: <AlertCircle className="h-4 w-4" />,
      className: 'text-destructive',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Orders"
        description="Manage payment transactions and orders"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data?.stats?.totalRevenue || 0, 'INR')}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          subtitle="vs. last month"
        />
        <StatsCard
          title="Successful Payments"
          value={data?.stats?.successfulPayments || 0}
          icon={CreditCard}
          trend="up"
          trendValue="+8.2%"
          subtitle="this month"
        />
        <StatsCard
          title="Pending Orders"
          value={data?.stats?.pendingOrders || 0}
          icon={TrendingUp}
          subtitle="awaiting payment"
        />
        <StatsCard
          title="Failed Payments"
          value={data?.stats?.failedPayments || 0}
          icon={AlertCircle}
          trend="down"
          trendValue="-3.1%"
          subtitle="vs. last month"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by order ID, email, or plan..."
              className="md:w-96"
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
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
        onView={handleViewDetails}
        customActions={customActions}
        emptyMessage="No payments found"
        emptyDescription="There are no payment transactions to display."
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
