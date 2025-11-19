import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * LoadingState Component
 * Skeleton loader for tables and cards
 */
export default function LoadingState({ rows = 5, cols = 4, type = 'table' }) {
  if (type === 'card') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(cols)].map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(rows)].map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {[...Array(cols)].map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
