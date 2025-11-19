import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

/**
 * DataTable Component
 * Reusable table with sorting, actions, and proper loading/empty states
 */
export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  customActions = [],
  sortable = true,
  emptyMessage = 'No data found',
  emptyDescription = 'There are no items to display.',
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const getSortedData = () => {
    if (!sortColumn || !data) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  };

  const renderSortIcon = (columnKey) => {
    if (!sortable) return null;
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (loading) {
    return <LoadingState rows={5} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} description={emptyDescription} />;
  }

  const sortedData = getSortedData();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.className}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                style={{ cursor: column.sortable !== false && sortable ? 'pointer' : 'default' }}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable !== false && renderSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
            {(onEdit || onDelete || onView || customActions.length > 0) && (
              <TableHead className="text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={row.id || index}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView || customActions.length > 0) && (
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(row)}>
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(row)}>
                          Edit
                        </DropdownMenuItem>
                      )}
                      {customActions.map((action, idx) => (
                        <DropdownMenuItem
                          key={idx}
                          onClick={() => action.onClick(row)}
                          className={action.className}
                        >
                          {action.icon && <span className="mr-2">{action.icon}</span>}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(row)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
