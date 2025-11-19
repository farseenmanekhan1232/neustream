import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';

/**
 * useAdminTable Hook
 * Reusable hook for fetching paginated, searchable, filterable table data
 * 
 * @param {string} endpoint - API endpoint (e.g., '/admin/users')
 * @param {object} options - Query options (page, limit, search, filters, etc.)
 * @returns {object} - React Query result with data, loading, error states
 */
export function useAdminTable(endpoint, options = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'desc',
    enabled = true,
  } = options;

  return useQuery({
    queryKey: [endpoint, page, limit, search, filters, sortBy, sortOrder],
    queryFn: async () => {
      // Build query params
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      // Add search if provided
      if (search) {
        params.search = search;
      }

      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== undefined && filters[key] !== null) {
          params[key] = filters[key];
        }
      });

      // Make API request
      const response = await adminApi.get(endpoint, { params });
      return response;
    },
    enabled,
    keepPreviousData: true, // Keep previous data while fetching new data
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}
