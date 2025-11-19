import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * StatusBadge Component
 * Displays status with appropriate colors
 */
export default function StatusBadge({ status, variant }) {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'active':
      case 'published':
      case 'completed':
      case 'paid':
      case 'success':
        return { variant: 'default', className: 'bg-green-100 text-green-700 border-green-300' };
      
      case 'inactive':
      case 'draft':
      case 'suspended':
      case 'canceled':
      case 'cancelled':
        return { variant: 'secondary', className: 'bg-gray-100 text-gray-700 border-gray-300' };
      
      case 'pending':
      case 'processing':
      case 'in_progress':
        return { variant: 'outline', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      
      case 'failed':
      case 'error':
      case 'rejected':
        return { variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-300' };
      
      default:
        return { variant: 'outline', className: '' };
    }
  };

  const config = variant ? { variant } : getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}
