import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * EmptyState Component
 * Displays when there's no data to show
 */
export default function EmptyState({
  icon: Icon = FileQuestion,
  message = 'No data found',
  description = 'There are no items to display.',
  action,
  actionLabel = 'Create New',
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{message}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {action && (
          <Button onClick={action} variant="default">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
