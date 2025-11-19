import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PageHeader Component
 * Consistent header for admin pages with title and actions
 */
export default function PageHeader({ title, description, actions, children }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * CreateButton Component
 * Standard button for creating new items
 */
export function CreateButton({ onClick, label = 'Create New' }) {
  return (
    <Button onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
